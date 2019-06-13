"use strict"

const BloggifyServer = require("./server")
    , ul = require("ul")
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
    , Path = require("path")

module.exports = class Bloggify extends EventEmitter {

    /**
     * Bloggify
     * Creates a new instance of `Bloggify`.
     *
     * @name Bloggify
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *   - `plugins` (Array): The plugins to load. A specific element should be
     *     either a string or an array of two values (the value name and the
     *     configuration object).
     *
     *     Example:
     *
     *     ```js
     *     [
     *        // Load the web sockets module
     *        "ws"
     *      , ["some-interesting-module",{
     *          "and": "some",
     *          "interesting": "configuration"
     *        }]
     *     ]
     *     ```
     *
     *     **Note**: If the module name starts with `bloggify-`, you can omit
     *     that part of the name.
     *     Example: To load `bloggify-ws`, you can simply use `ws`.
     *
     *   - `core_plugins` (Array): Like `plugins`, but these have greater
     *      priority when starting the app.
     *
     *      There are some additional core plugins which are loaded automatically.
     *
     *      The specific order of loading core plugins is:
     *
     *       0. Models (sequelize/mongoose)
     *       1. Custom plugins configured in `bloggify.js(on)`
     *       2. Actions
     *       3. Router
     *       4. Renderer(s)
     *
     *   - `title` (String): The application name. For convenience (in case it's
     *      not set), the default is an empty string (`""`).
     *
     *   - `description` (String): The application description. For convenience
     *      (in case it's not set), the default is an empty string (`""`).
     *
     *   - `db_uri` (String): The database URI. It can be set in the options,
     *      or via an environment variable: `DB_URI`. The recommended way is
     *      to use the environment variable set in the `.env` file or in the
     *      deployment platform settings (e.g. Heroku).
     *
     *      The uri is parsed and the specific dialect is handled. Currently,
     *      these dialects are supported:
     *
     *      **`mongodb`**
     *
     *      URI: `mongodb://localhost/your-database-name`
     *      Needed peer dependencies: `connect-mongo`, `bloggify-mongoose`
     *
     *      You need to install these in your app folder:
     *
     *      ```sh
     *      npm install connect-mongo bloggify-mongoose
     *      ```
     *
     *      If no models are used, you don't need to install
     *      `bloggify-mongoose`. `connect-mongo` will be used for
     *      session management.
     *
     *      The models will be created in the models folder (default: `app/models`).
     *
     *      Example:
     *
     *      **`Topic.js`**
     *      ```
     *      const TopicSchema = new Bloggify.db.Schema({
     *          title: {
     *              type: String,
     *              text: true
     *          },
     *          body: {
     *              type: String,
     *              text: true
     *          },
     *      })
     *      module.exports = Bloggify.db.model("Topic", TopicSchema)
     *      ```
     *
     *      **`mysql`**
     *
     *      URI: `DB_URI=mysql://root:password@host:port/your-database-name`
     *      Needed peer dependencies: `express-mysql-session`, `bloggify-sequelize`
     *
     *      You need to install these in your app folder:
     *
     *      ```sh
     *      npm install connect-mongo bloggify-mongoose
     *      ```
     *
     *      If no models are used, you don't need to install
     *      `bloggify-mongoose`. `connect-mongo` will be used for
     *      session management.
     *
     *      The models will be created in the models folder (default: `app/models`).
     *
     *      Example:
     *
     *      **`User.js`**
     *
     *      ```js
     *      const Sequelize = Bloggify.sequelize
     *
     *      const Subject = Sequelize.db.define("subject", {
     *          name: {
     *              type: Sequelize.STRING
     *          }
     *      }, {
     *          charset: "utf8mb4"
     *      })
     *
     *      module.exports = Subject
     *      ```
     *
     *   -  `db_options` (Object): Additional options to be passed to the
     *      database plugin (`bloggify-sequelize` or `bloggify-mongoose`).
     *   - `server` (Object) Server ([`lien`](https://github.com/lienjs/lien)) related settings.
     *     - `port` (Boolean): The server's port (default: `process.env.PORT || 8080`).
     *     - `host` (Boolean): The server's host (default: `null`).
     *     - `csrf` (Boolean): Wether to enable csrf validation or not (default: `true`).
     *     - `session` (Object|Boolean): The session settings, or `false` to
     *        disable the session management. In most of the cases you will
     *        not need to change this.
     *   - `paths` (Object): The paths options. Do *not* change these unless you have a good reason.
     *     - `bloggify` (String): The Bloggify directory (by default the root of the app).
     *     - `public_main` (String): The public directory endpoint (default: `"/@/bloggify/public/"`)
     *     - `public_assets` (String): The public core endpoint (default: `"/@/bloggify/assets/"`)
     *     - `css_assets` (String): The CSS assets endpoint (default: `"/@/bloggify/css-assets/"`)
     *     - `errors` (String): (default: `"/app/errors"`)
     *     - `models` (String): (default: `"/app/models"`)
     *     - `controllers` (String): (default: `"/app/controllers"`)
     *     - `routes` (String): (default: `"/app/routes"`)
     *     - `services` (String): (default: `"/app/services"`)
     *     - `partials` (String): (default: `"/app/partials"`)
     *     - `actions` (String): (default: `"/app/actions"`)
     *     - `plugins` (String): (default: `"/node_modules"`)
     *     - `config` (String): The config file: `bloggify.js(on)` (default: `"/bloggify"`).
     *     - `package` (String): The `package.json` file path (default: `"package.json"`).
     *   - `bundler` (Object): The bundler options (see [`rucksack`](https://github.com/Bloggify/rucksack)).
     *     - `aliases` (Object): The aliases that should be made in the scripts.By default, the following are included. If needed, you can extend with yours:
     *       - `bloggify` :arrow_right: `${__dirname}/client/index.js`
     *       - `bloggify/actions` :arrow_right: `${__dirname}/client/actions.js`
     *       - `bloggify/actions/common` :arrow_right: `${__dirname}/client/common`
     *   - `renderer` (String): The module to be used for rendering (default: `"bloggify-template-renderer"`).
     *   - `renderers` (Object): An object containing the renderer options.
     *     - `ajs`: {}
     *
     * @returns {Bloggify} The `Bloggify` instance.
     */
    constructor (options) {

        super()
        const self = global.Bloggify = this

        // Now, since we have an instance, expose it
        const originalRequire = Module.prototype.require;
        Module.prototype.require = function (name) {
            if (name === "bloggify") {
                return self
            }
            return originalRequire.apply(this, arguments)
        }

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
        this.options = options = ul.deepMerge(
            options,
            maybeRequire(`${options.root}${defaultOptions.paths.config}`, true),
            defaultOptions
        )

        // Initialize the paths
        const paths = this.paths = new BloggifyPaths(options.root, options, this)

        options = this.options

        // Check for defaults in assets
        const PATH_STYLESHEETS_MANIFEST = "app/assets/stylesheets/application.css"
        const PATH_JAVASCRIPTS_MANIFEST = "app/assets/javascripts/application.js"

        if (!options.styles && isThere(PATH_STYLESHEETS_MANIFEST)) {
            options.styles = PATH_STYLESHEETS_MANIFEST
        }

        if (!options.scripts && isThere(PATH_JAVASCRIPTS_MANIFEST)) {
            options.scripts = PATH_JAVASCRIPTS_MANIFEST
        }

        if (typeof options.styles === "string") {
            options.styles = [options.styles]
        }

        if (typeof options.scripts === "string") {
            options.scripts = [options.scripts]
        }

        // Initialize the public paths
        this.paths.initPublicPaths()

        // Initialize the plugin loader
        this.pluginLoader = new PluginLoader(this)

        this.errors = new ErrorCreator()
        if (isThere(this.paths.errors)) {
            this.errors.add(requireDir(this.paths.errors))
        }

        // partials
        this.partials = {}
        if (isThere(this.paths.partials)) {
            this.partials = fileTree.sync(this.paths.partials)
            const walk = (obj, key, parent) => {
                if (obj.path) {
                    parent[key.split(".")[0]] = obj.path
                    return
                }
                forEach(obj, (o, k) => walk(o, k, obj))

            }
            walk(this.partials)
        }

        // Models
        this.models = {}
        const corePlugins = []
            , foundModels = isThere(this.paths.models)

        if (options.db_uri) {
            options.db_options = require("parse-db-uri")(options.db_uri)
            switch (options.db_options.dialect) {
                case "mongodb":
                    if (options.server.session !== false) {
                        options.server.session = {
                            store: "connect-mongo"
                          , storeOptions: {
                                url: options.db_uri
                            }
                        }
                    }
                    if (foundModels) {
                        corePlugins.push(["bloggify-mongoose", Object.assign({
                            uri:  options.db_uri
                          , models_dir: this.paths.models
                        }, options.db_options)])
                    }
                    break
                case "mysql":
                    if (options.server.session !== false) {
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
                    }
                    if (foundModels) {
                        corePlugins.push(["bloggify-sequelize", {
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
                        }])
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
            corePlugins.push("bloggify-actions")
        }

        // Routes
        if (isThere(this.paths.routes)) {
            corePlugins.push(["bloggify-flexible-router", {
                routes_dir: this.paths.routes
            }])
        }

        if (options.renderers) {
            options.Renderer = require(options.renderer)
            this.renderer = new options.Renderer(this)
            forEach(options.renderers, (config, name) => {
                name = `bloggify-renderer-${name}`
                corePlugins.push([name, config])
            })
        }

        // Enable the adapter
        if (options.adapter) {
            const cmsMethods = require("./cms-methods")
            this.extend(cmsMethods)
            corePlugins.push(options.adapter)
        }

        options.core_plugins = [
            foundModels ? corePlugins.splice(0, 1)[0] : null
          , ...options.core_plugins
          , ...corePlugins
        ]

        // Load the core plugins
        //
        // 0) Models (sequelize/mongoose)
        // 1) Custom plugins (from bloggify.js)
        // 2) Actions
        // 3) Router
        // 4) Renderer(s)
        this.log("Loading the core plugins")
        this.loadPlugins(options.core_plugins).then(() => {
            this.log("Loading the plugins")
            return this.loadPlugins(options.plugins)
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
        return new Promise(resolve => {
            if (this._ready) {
                process.nextTick(fn => {
                    if (fn) fn()
                    resolve()
                })
                return
            }
            this.once("ready", () => {
                if (fn) fn()
                resolve()
            })
        })
    }

    initPlugin (plugin, config) {
        if (Array.isArray(plugin)) {
            config = plugin[1]
            plugin = plugin[0]
        }
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

        data.Bloggify = this
        data.context = data.ctx = data.lien = lien
        data.template = templateName
        data.siteMetadata = this.options.metadata || {}
        data.page = data.page || {}
        data._public = (filePath, absolute) => this.paths.staticFilePath(filePath, absolute)
        data.f = i => i in data
        data.require = require
        data.stringify = function () {
            // TODO XSS proof
            return JSON.stringify.apply(JSON, arguments).replace(/\//g, "\\u002f")
        }

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
        this._log_level = newLogLevel
        return newLogLevel
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

    /**
     * exit
     * Closes the Bloggify app.
     *
     * @name exit
     * @function
     * @param {Number} code The exit code.
     * @param {Boolean} force Force the closing of the process.
     * @param {Number} delay An optional delay.
     */
    exit (code, force, delay) {
        if (delay) {
            delay = Number(delay)
            this.log(`Waiting ${delay}ms`)
            setTimeout(() => this.exit(code, force), delay)
        } else {
            process.on("exit", code => {
                this.log(`Closing the app with exit code ${code}.`)
            });
            this.log(`Closing the server.`)
            this.server.server.close(err => {
                if (err) { this.log(err, "error") }
                if (typeof code === "number" || code === true || force) {
                    code = typeof code === "number" ? code : 0
                    process.exit(Number(code))
                }
            })
        }
    }

    /**
     * extend
     * Extends the Bloggify instance with new methods.
     *
     * @name extend
     * @function
     * @param {Object} methods An object containing functions you want to append to the `Bloggify` instance.
     * @returns {Bloggify} The `Bloggify` instance.
     */
    extend (methods) {
        forEach(methods, (fn, c) => {
            this[c] = fn
        })
        return this
    }
}
