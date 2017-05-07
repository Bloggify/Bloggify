"use strict";

const ul = require("ul")
    , Lien = require("lien")
    , forEach = require("iterate-object")
    , path = require("path")
    , crypto = require("crypto")
    , readJson = require("safe-r-json")
    , writeJson = require("w-json")
    ;

module.exports = {
    _initServer () {
        const Bloggify = this;
        const options = this.options;
        options.server.public = this.paths.getPublicPaths();

        this.server = new Lien(options.server);
        this._serverLoaded = false;
        this._serverPort = options.server.port;
        this.server.on("load", (err, data) => {
            this._serverLoaded = [err, data];
        });

        Lien.LienObj.prototype.render = function (tmpl, data) {
            return Bloggify.render(this, tmpl, data);
        };

        options._bundler = options._bundler || require("rucksack");

        this.Bundler = options._bundler;
        this.bundles = {};
        this.assets = this.createBundler();

        if (options.loadPlugins !== false) {
            this.loadPlugins();
        }

        let serveFirstRequests = () => {
            if (!firstRequests._called) {
                firstRequests._called = true;
                firstRequests.forEach(c => c[1]());
                this.log(`The application is running at ${this.options.metadata.domain}`);
            }
        };

        let firstRequests = this._firstRequests = [];
        if (process.argv.includes("--no-wait-for-bundle")) {
            this.on("plugins-loaded", () => {
                serveFirstRequests();
            });
        }

        const exitAfterBundle = process.argv.includes("--exit-after-bundle");
        if (exitAfterBundle) {
            options.exitAfterBundle = exitAfterBundle;
        }

        this.on("plugins-loaded", () => {
            Promise.all(Object.keys(this.bundles).map(c => {
                if (process.argv.includes("--no-bundle")) {
                    return;
                }
                return this.bundles[c].bundle();
            })).then(() => {
                this.log(`Bundles generated`);
                if (exitAfterBundle) {
                    process.exit(0);
                    return;
                }
                serveFirstRequests();
            }).catch(e => {
                this.log("There was a problem creating the bundles.", "error");
                this.log(e.stack, "error");
            });
        });

        this.server.hook("before", "*", (lien, cb) => {
            if (firstRequests._called) {
                return cb();
            }
            firstRequests.push([lien, cb]);
        });

        let existingMap = readJson(this.paths.cssUrlMap);
        this._cssUrlMap = {};
        forEach(existingMap, (filePath, hash) => {
            this._addHashedCssUrl(hash, filePath);
        });
        existingMap = null;
    }

  , _addHashedCssUrl (hashed, filePath, save) {

        if (this._cssUrlMap[hashed] === filePath) {
            return;
        }

        this._cssUrlMap[hashed] = filePath;
        if (save) {
            this._cssUrlMapSave();
        }

        this.server.addPage(hashed, path.resolve(this.paths.root, filePath));
    }

  , _addCssUrl (url, filePath, save) {
        const basename = path.basename(url)
            , hash = crypto.createHash("md5").update(url).digest("hex")
            , resUrl = `${this.paths._paths.cssUrls}${hash}-${basename}`
            ;

        this._addHashedCssUrl(resUrl, filePath, save);
        return resUrl;
    }

  , _cssUrlMapSave (cb) {
        writeJson(this.paths.cssUrlMap, this._cssUrlMap, cb);
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
        let bundles = bloggifyConfig.bundles || {};
        forEach(bundles, (conf, name) => {
            let bndl = this.createBundler(name);
            if (!bndl) {
                this.log(new Error(`Bundle '${name}' does not exist.`));
            } else {
                bndl.add(conf, root);
            }
        });
        this.assets.add(bloggifyConfig, root);
    }

    /**
     * createBundler
     * Creates a new Bundler instance.
     *
     * @param  {Object|String} options The Bloggify options | The bundler name.
     * @return {Object}         Returns the new Bundler or an existing one if its name is already used.
     */
  , createBundler (options) {
        options = options || "main";
        if (typeof options === "string") {
            let paths = this.paths.getBundlePaths(options);
            options = {
                jsOutput: paths.local.js
              , cssOutput: paths.local.css
              , jsUrl: paths.urls.js
              , cssUrl: paths.urls.css
              , name: options
              , cacheFile: paths.cacheFile
            };
        }

        options = ul.merge(options, {
            development: !!~process.argv.indexOf("--production-bundle") ? false : !this.production
          , aliases: this.options.bundler.aliases
          , cssUrlHook: (url, decl, from, dirname) => {
                if (/https?\:/.test(url)) { return url; }
                url = url.split("?").shift();
                const fullPath = path.relative(this.paths.root, path.resolve(dirname, url));
                return this._addCssUrl(url, fullPath, true);
            }
        });

        let existing = this.bundles[options.name];
        if (existing) {
            return existing;
        }

        return this.bundles[options.name] = new this.Bundler(options);
    }

    /**
     * onLoad
     * Checkes if the server is loaded.
     *
     * @param  {Funcion} cb The callback function.
     */
  , onLoad (cb) {
        if (this._serverLoaded) {
            return cb(this._serverLoaded[0], this._serverLoaded[1]);
        }
        this.server.on("load", cb);
    }
};
