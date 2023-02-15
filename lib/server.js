"use strict"

const ul = require("ul")
    , Lien = require("lien")
    , forEach = require("iterate-object")
    , path = require("path")
    , crypto = require("crypto")
    , readJson = require("safe-r-json")
    , writeJson = require("w-json")
    , isThere = require("is-there")
    , requireDir = require("require-dir")
    , localIP = require("local-ip-address")

module.exports = {
    _initServer () {
        const Bloggify = this
        const options = this.options
        options.server.public = this.paths.getPublicPaths()

        const exitAfterBundle = process.argv.includes("--exit-after-bundle")

        this.developmentBundles = !!~process.argv.indexOf("--production-bundle") ? false : !this.production
        this.server = new Lien(options.server)
        this._serverLoaded = false
        this._serverPort = options.server.port
        this.server.on("load", (err, data) => {
            this._serverLoaded = [err, data]
        })
        this.server.server.on("error", err => {
            if (err.code === "EADDRINUSE") {
                Bloggify.log(`Port ${options.server.port} is in use. Please set another port.`, "error")
            }
            Bloggify.log(err)
            process.exit(1)
        })

        Lien.LienObj.prototype.render = function (tmpl, data) {
            return Bloggify.render(this, tmpl, data)
        }

        const bundlerName = "rucksack" + (exitAfterBundle || this.developmentBundles ? "" : "-lite")

        options._bundler = options._bundler || require(bundlerName)

        this.Bundler = options._bundler
        this.bundles = {}
        this.assets = this.createBundler()

        // Initialize the services
        this.services = {}
        if (isThere(this.paths.services)) {
            this.services = requireDir(this.paths.services)
        }

        let serveFirstRequests = () => {
            if (firstRequests._called) { return; }
            this.emit("ready")
            firstRequests._called = true
            firstRequests.forEach(c => c())

            this.log("")
            this.log(`Application is running at:`)
            this.log(` - Production    :: ${this.options.domain}`)
            this.log(` - Local Server  :: http://localhost:${this._serverPort}`)
            this.log(` - Local Network :: http://${localIP()}:${this._serverPort}`)
            this.log("")

            const stack = this.server.beforeRequest.stack
            const index = stack.map(c => c.handle).indexOf(readyMiddleware)
            stack.splice(index, 1)
        }

        let firstRequests = this._firstRequests = []
        if (process.argv.includes("--no-wait-for-bundle")) {
            this.on("plugins-loaded", () => {
                serveFirstRequests()
            })
        }

        if (exitAfterBundle) {
            options.exitAfterBundle = exitAfterBundle
        }

        this._noBundle = process.argv.includes("--no-bundle")

        this.on("plugins-loaded", () => {
            Promise.all(Object.keys(this.bundles).map(c => {
                if (this._noBundle) {
                    return
                }
                return this.bundles[c].bundle()
            })).then(() => {
                this.log(`Bundles generated`)
                if (exitAfterBundle) {
                    process.exit(0)
                    return
                }
                serveFirstRequests()
            }).catch(e => {
                this.log("There was a problem creating the bundles.", "error")
                this.log(e.stack, "error")
                serveFirstRequests()
            })
        })

        const readyMiddleware = (req, res, next) => {
            if (firstRequests._called) {
                return next()
            }
            firstRequests.push(next)
        }

        if (options.x_powered_by !== false) {
            this.server.beforeRequest.use((req, res, next) => {
                res.setHeader("X-Powered-By", options.x_powered_by)
                next()
            })
        }

        this.server.beforeRequest.use(readyMiddleware)

        let existingMap = readJson(this.paths.cssUrlMap)
        this._cssUrlMap = {}
        forEach(existingMap, (filePath, hash) => {
            this._addHashedCssUrl(hash, filePath)
        })
        existingMap = null
    }

  , _addHashedCssUrl (hashed, filePath, save) {

        if (this._cssUrlMap[hashed] === filePath) {
            return
        }

        this._cssUrlMap[hashed] = filePath
        if (save) {
            this._cssUrlMapSave()
        }

        this.server.addPage(hashed, path.resolve(this.paths.root, filePath))
    }

  , _addCssUrl (url, filePath, save) {
        const basename = path.basename(url)
            , hash = crypto.createHash("md5").update(url).digest("hex")
            , resUrl = `${this.paths._paths.css_assets}${hash}-${basename}`


        this._addHashedCssUrl(resUrl, filePath, save)
        return resUrl
    }

  , _cssUrlMapSave (cb) {
        writeJson(this.paths.cssUrlMap, this._cssUrlMap, cb)
    }

    /**
     * handleBundleConfig
     * Initializes the configuration for each Bundle.
     *
     * @param  {Object} bloggifyConfig The config item.
     * @param  {String} root           The root path of the assets.
     */
  , handleBundleConfig (bloggifyConfig, root) {
        if (!bloggifyConfig) { return; }

        let bundles = bloggifyConfig.bundles || {}

        forEach(bundles, (conf, name) => {
            let bndl = this.createBundler(name)
            if (!bndl) {
                this.log(new Error(`Bundle '${name}' does not exist.`))
            } else {
                bndl.add(conf, root)
            }
        })

        this.assets.add(bloggifyConfig, root)
    }

    /**
     * createBundler
     * Creates a new Bundler instance.
     *
     * @param  {Object|String} options The Bloggify options | The bundler name.
     * @return {Object}         Returns the new Bundler or an existing one if its name is already used.
     */
  , createBundler (options) {
        options = options || "main"
        if (typeof options === "string") {
            let paths = this.paths.getBundlePaths(options)
            options = {
                jsOutput: paths.local.js
              , cssOutput: paths.local.css
              , jsUrl: paths.urls.js
              , cssUrl: paths.urls.css
              , name: options
              , cacheFile: paths.cacheFile
            }
        }

        options = ul.merge(options, this.options.bundler, {
            development: this.developmentBundles
          , cssUrlHook: (url, { file }) => {
                url = url.url
                if (url.startsWith("/") || /^(data|https?)\:/.test(url)) { return url; }
                url = url.split("?").shift()
                const fullPath = path.relative(this.paths.root, path.resolve(file, url))
                return this._addCssUrl(url, fullPath, true)
            }
        })

        let existing = this.bundles[options.name]
        if (existing) {
            return existing
        }

        let ret = this.bundles[options.name] = new this.Bundler(options)
        return ret
    }

    /**
     * onLoad
     * Checkes if the server is loaded.
     *
     * @param  {Funcion} cb The callback function.
     */
  , onLoad (cb) {
        if (this._serverLoaded) {
            return cb(this._serverLoaded[0], this._serverLoaded[1])
        }
        this.server.on("load", cb)
    }
}
