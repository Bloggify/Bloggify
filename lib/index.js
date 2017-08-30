"use strict"

const BloggifyServer = require("./server")
    , ul = require("ul")
    , mapO = require("map-o")
    , readJson = require("safe-r-json")
    , typpy = require("typpy")
    , deffy = require("deffy")
    , BloggifyPaths = require("./paths")
    , Module = require("module")
    , forEach = require("iterate-object")
    , noop = require("noop6")
    , PluginLoader = require("bloggify-plugin-loader")
    , EventEmitter = require("events")
    , Logger = require("cute-logger")
    , ErrorCreator = require("error-creator")
    , requireDir = require("require-dir")
    , isThere = require("is-there")
    , abs = require("abs")
    , maybeRequire = require("maybe-require")
    , parseUrl = require("parse-url")
    , dotenv = require("dotenv")
    , fileTree = require("fs-file-tree")


module.exports = class Bloggify extends EventEmitter {

    /**
     * Bloggify
     * Creates a new instance of `Bloggify`.
     *
     * @name Bloggify
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `plugins`: plugins to load
     *  - `pluginConfigs`: plugin configs
     *  - `metadata`:
     *       - `siteTitle`: the site title
     *       - `siteDescription`: the site title
     *       - `domain`: the site domain
     *  - `corePlugins`: `[ "bloggify-plugin-manager", "bloggify-router" ]`
     *  - `server`: The lien settings.
     *
     * @returns {Bloggify} The `Bloggify` instance.
     */
    constructor (options) {

        super()
        const self = global.Bloggify = this

        // Now, since we have an instance, expose it
        module.exports = self;

        const isProduction = this.production = process.env.NODE_ENV === "production"

        // Handle errors smoothly
        if (isProduction || process.argv.includes("--catch-exceptions")) {
            process.on("uncaughtException", err => {
                this.log("Fatal error:", "error")
                console.log("The error is: ", err)
                this.log(err && err.stack || err, "error")
            })
        }

        this.on("error", e => {
            this.log(e, "error")
        })

        // Log level related functinality
        let logLevel = process.env.BLOGGIFY_LOG_LEVEL
        Logger.config.date = isProduction
        if (this.production && !logLevel) {
            logLevel = 1
        }
        this.logLevel(logLevel)

        // Default the options to the CWD path.
        options = options || process.cwd()

        // Initialize the options object
        if (typeof options === "string") {
            options = { root: options }
        }

        options.root = abs(options.root)
        dotenv.config({ path: `${options.root}/.env` })

        // Merge the Bloggify defaults
        const defaultOptions = require("./defaults")
        this.options = options = ul.deepMerge(options, maybeRequire(`${options.root}${defaultOptions.paths.config}`, true), defaultOptions)

        // Initialize the paths
        const paths = this.paths = new BloggifyPaths(options.root, options, this)

        options = this.options

        // Initialize the public paths
        this.paths.initPublicPaths()

        // Initialize the plugin loader
        this.pluginLoader = new PluginLoader(this)

        this.errors = new ErrorCreator()
        if (isThere(this.paths.errors)) {
            this.errors.add(requireDir(this.paths.errors))
        }

        // Views
        this.views = {}
        if (isThere(this.paths.views)) {
            this.views = fileTree.sync(this.paths.views)
            const walk = (obj, key, parent) => {
                if (obj.path) {
                    parent[key.split(".")[0]] = obj.path
                    return
                }
                forEach(obj, (o, k) => walk(o, k, obj))

            }
            walk(this.views)
        }

        // Models
        this.models = {}
        let startupPromises = []
        if (options.db_uri) {
            options.db_options = require("parse-db-uri")(options.db_uri)

            const foundModels = isThere(this.paths.models)

            switch (options.db_options.dialect) {
                case "mongodb":
                    options.server.session = {
                        store: "connect-mongo"
                      , storeOptions: {
                            url: options.db_uri
                        }
                    }
                    if (foundModels) {
                        startupPromises.push(this.initPlugin("bloggify-mongoose", {
                            uri:  options.db_uri
                          , models_dir: this.paths.models
                        }))
                    }
                    break
                case "mysql":
                    options.server.session = {
                        store: "express-mysql-session"
                      , storeOptions: {
                            user: options.db_options.user
                          , password: options.db_options.password
                          , host: options.db_options.host
                          , port: options.db_options.port
                          , database: options.db_options.database
                        }
                    }
                    if (foundModels) {
                        startupPromises.push(this.initPlugin("bloggify-sequelize", {
                            uri:  options.db_uri
                          , models_dir: this.paths.models
                          , options: Object.assign({
                                pool: {
                                    max: 5
                                  , min: 0
                                  , idle: 10000
                                }
                              , logging: this.production ? false : this.log.bind(this)
                              , define: {
                                    underscored: true
                                }
                            }, options.db_options)
                        }))
                    }
                    break
            }
        }

        // Start the server
        this.extend(BloggifyServer)
        this._initServer()

        // Read the package
        this.package = readJson(this.paths.package)
        this.handleBundleConfig(options, this.paths.root)

        // Actions
        this._actions = {}
        if (isThere(this.paths.actions)) {
            this.actions = require("./actions")(this)
            startupPromises.push(this.initPlugin("bloggify-actions"))
        }

        // Routes
        if (isThere(this.paths.routes)) {
            startupPromises.push(this.initPlugin("bloggify-flexible-router", {
                routes_dir: this.paths.routes
            }))
        }

        if (options.renderers) {
            options.Renderer = options.Renderer || require("bloggify-template-renderer")
            this.renderer = new options.Renderer(this)
            forEach(options.renderers, (config, name) => {
                name = `bloggify-renderer-${name}`
                startupPromises.push(this.initPlugin(name))
            })
        }

        // Enable the adapter
        if (options.adapter) {
            if (typeof options.adapter === "string") {
                options.adapter = [options.adapter, {}]
            }
            this.adapter = new (require(options.adapter[0]))(options.adapter[1])
            const cmsMethods = require("./cms-methods")
            this.extend(cmsMethods)
        }

        // Load the core plugins
        Promise.all(startupPromises).then(() => {
            this.log("Loading the plugins", "info")
            return this.loadPlugins(options.plugins);
        }).then(data => {
            process.nextTick(() => {
                this.log("Initialized plugins.")
                this.emit("plugins-loaded")
            })
        }).catch(err => {
            if (err) {
                this.log("Failed to start.", "error")
                this.log(err, "error")
            }
            this.emit("ready", err)
            this.emit("plugins-loaded", err)
        })
        this.ready(() => {
            this._ready = true
        })
    }

    ready (fn) {
        if (this._ready) {
            process.nextTick(fn)
            return
        }
        this.once("ready", fn)
    }

    initPlugin (plugin, config) {
        const plug = this.pluginLoader.getPlugin(plugin)
        plug.config = config
        return this.pluginLoader.initPlugin(plug)
    }

    /**
     * render
     * Renders a template.
     *
     * @name render
     * @function
     * @param {Lien} lien The `lien` object.
     * @param {String} templateName The template name or path.
     * @param {Object} data The template data.
     */
    render (lien, templateName, data) {

        data = data || {}

        data = ul.merge(data, {
            Bloggify: this
          , lien: lien
          , ctx: lien
          , context: lien
          , template: templateName
          , siteMetadata: this.options.metadata || {}
          , page: data.page || {}
          , _public: (filePath, absolute) => this.paths.staticFilePath(filePath, absolute)
          , f (i) { return i in this; }
          , require: require
          , stringify () {
                return JSON.stringify.apply(JSON, arguments).replace(/\//g, "\\u002f")
            }
        })

        if (data.error) {
            data.error.statusCode = data.error.status || data.error.statusCode || (
                /not found|enoent/i.test(data.error.message) ? 404 : 500
            )
            if (!data.forceTemplateName) {
                templateName = data.error.statusCode.toString()
            }
        }

        data.title = data.title || data.page.title || ""
        this.renderer.render(lien, templateName, data)
    }

    /**
     * loadPlugins
     * Loads the provided plugins.
     *
     * @param  {Array} names The list of plugin names.
     * @param  {Function} cb The callback function.
     */
    loadPlugins (plugins, cb) {
        return this.pluginLoader.loadAll(plugins, cb)
    }

    /**
     * require
     * Considering the value of the module (`true`, `false`), it returns the raw module of the plugin or the instance of it.
     *
     * @param  {String} name    The plugin's name.
     * @param  {Boolean} mod    The plugin's module.
     * @return {BloggifyPlugin} The plugin's instance.
     */
    require (name, mod, cb) {
        return this.pluginLoader.get(name, mod, cb)
    }

    /**
     * logLevel
     * Sets or gets the log level.
     *
     * The log levels are:
     *
     *   - `0`: Ignore everything
     *   - `1`: Errors
     *   - `2`: Errors + Warnings
     *   - `3`: Errors + Warnings + Info
     *   - `4`: Everything
     *
     * @param  {String} newLogLevel The instance of the log.
     * @return {String}             The log level.
     */
    logLevel (newLogLevel) {
        newLogLevel = parseInt(newLogLevel)
        if (!typpy(newLogLevel, Number)) {
            return this._log_level
        }
        Logger.config.level = newLogLevel
        return this._log_level = newLogLevel
    }

    /**
     * log
     * Prints a log message in the output.
     *
     * @name log
     * @function
     * @param {Error|String} msg The log message.
     * @param {String} type The log type (error|info|warn|log).
     * @param {Stream} stream The output stream (defaults to `process.stderr` for errors and `process.stdout` for other logs).
     * @param {Boolean} newLine A flag wheter to add a new line at the end of the message or not.
     */
    log (msg, type, stream, newLine) {
        newLine = deffy(newLine, true)
        if (msg instanceof Error) {
            type = type || "error"
            msg = msg.stack
        } else {
        //    msg = String(msg)
        }
        type = deffy(type, "log")
        if (!stream) {
            Logger.log(msg, type)
            return
        }
        if (newLine) {
            msg += "\n"
        }
        stream = type === "error" ? process.stderr : process.stdout
        stream.write(msg)
    }

    extend (methods) {
        forEach(methods, (fn, c) => {
            this[c] = fn
        })
    }
}
