"use strict";

const BloggifyServer = require("./server")
    , defaultOptions = require("./defaults")
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
    , Logger = require("bug-killer")
    ;

module.exports = class Bloggify extends EventEmitter {

    /**
     * Bloggify
     * Creates a new instance of `Bloggify`.
     *
     * @name Bloggify
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `loadPlugins`: false
     *  - `plugins`: plugins to load
     *  - `pluginConfigs`: plugin configs
     *  - `metadata`:
     *       - `siteTitle`: the site title
     *       - `siteDescription`: the site title
     *       - `domain`: the site domain
     *  - `corePlugins`: `[ "bloggify-plugin-manager", "bloggify-router" ]`
     *  - `server`: The lien settings.
     *  - `theme`:
     *       - `path`: the theme path (default: `"theme"`)
     *       - `public`: the theme public directory (default: `"public"`)
     *  - `adapter`: Adapter settings
     *       - `paths`:
     *              - `articles`: the path to the articles dir (default: `"content/articles"`)
     *              - `pages`: the path to the pages dir (default: `"content/pages"`)
     *
     * @param {BloggifyAdapter} adapter A custom content adapter.
     * @returns {Bloggify} The `Bloggify` instance.
     */
    constructor (options) {

        super();

        const isProduction = process.env.NODE_ENV === "production";
        // Handle errors smoothly
        if (isProduction || process.argv.includes("--catch-exceptions")) {
            process.on("uncaughtException", err => {
                this.log("Fatal error:", "error");
                console.log("The error is: ", err);
                this.log(err && err.stack || err, "error");
            });
        }

        this.on("error", e => {
            this.log(e, "error");
        });

        let logLevel = process.env.BLOGGIFY_LOG_LEVEL;
        if (this.production && !logLevel) {
            logLevel = 1;
        }
        this.logLevel(logLevel);

        // Default the options to the CWD path.
        options = options || process.cwd();

        // Initialize the options object
        if (typeof options === "string") {
            options = { root: options };
        }

        // Merge the Bloggify defaults
        this.options = options = ul.deepMerge(options, defaultOptions);
        this.paths = new BloggifyPaths(options.root, options, this);
        this.options = options = this.getConfig();
        this.paths.initPublicPaths();

        this.pluginLoader = new PluginLoader(this);
        this.production = isProduction;
        this.models = {};
        this.logger = {
            info: msg => { this.log(msg, "info"); }
          , log: msg => { this.log(msg, "info"); }
          , error: msg => { this.log(msg, "error"); }
          , warn: msg => { this.log(msg, "warn"); }
        };

        this.extend(BloggifyServer);
        this._initServer();

        const originalRequire = Module.prototype.require;
        Module.prototype.require = function (name) {
            if (name === "bloggify") {
                return Bloggify;
            }
            return originalRequire.apply(this, arguments);
        };


        // From this moment, we have an instance of Bloggify
        const Bloggify = this;

        this.package = readJson(`${this.paths.root}/package.json`);
        this.handleBundleConfig(this.package.bloggify, this.paths.root);

        mapO(options.adapter.paths, value => `${this.paths.root}/${value}`);

        // Normalize the adapter paths
        options.Adapter = options.Adapter || require("bloggify-markdown-adapter");
        options.Viewer = options.viewer || require("bloggify-theme-renderer");

        this.adapter = new options.Adapter(this);
        this.viewer = new options.Viewer(this);

        this.options.metadata.title = this.options.metadata.title || this.options.metadata.siteTitle;
        if (!this.options.metadata.domain) {
            this.log("Warning: Please provide your website domain in metadata.", "warn");
        }

        // Load the core plugins
        this.log("Loading the core plugins", "info");
        this.loadPlugins(options.corePlugins, (err, data) => {
            if (err) {
                this.log("Failed to initialize the plugins.", "error");
                this.log(err, "error");
            } else {
                this.log("Initialized plugins.");
            }
            this.emit("ready", err, data);
        });

        if (options.cms_methods) {
            const cmsMethods = require("./cms-methods");
            this.extend(cmsMethods);
        }
        if (options.actions !== false) {
            this.actions = require("./actions")(this);
        }
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

        data = data || {};

        data = ul.merge(data, {
            Bloggify: this
          , lien: lien
          , template: templateName
          , siteMetadata: this.options.metadata || {}
          , page: data.page || {}
          , _public: (filePath, absolute) => this.paths.staticFilePath(filePath, absolute)
          , f (i) { return i in this; }
          , stringify () {
                return JSON.stringify.apply(JSON, arguments).replace(/\//g, "\\u002f");
            }
        });

        if (data.error) {
            data.error.statusCode = data.error.statusCode || (
                /not found|enoent/i.test(data.error.message) ? 404 : 500
            );
            if (!data.forceTemplateName) {
                templateName = data.error.statusCode.toString();
            }
        }

        data.title = data.title || data.page.title || "";

        this.viewer.render(lien, templateName, data);
    }

    /**
     * registerRouter
     * Registers a new router.
     *
     * @name registerRouter
     * @function
     * @param {BloggifyRouter} router The Bloggify router to register.
     */
    registerRouter (router) {
        if (this.router) {
            throw new Error("There is already a registered router.");
        }
        this.router = router;
    }

    /**
     * getConfig
     * Fetches the configuration of the Bloggify instance. If the callback function is not provided, the config object will be returned.
     *
     * @param  {Function} cb The callback function.
     * @return {Object}      The configuration.
     */
    getConfig (cb) {
        cb = cb || noop;
        let conf = this.options;
        try {
            conf = ul.deepMerge(require(this.paths.config), conf)
        } catch (e) {
            if (e.code !== "MODULE_NOT_FOUND") {
                cb(e, conf);
                this.emit("error", e);
                return conf;
            }
            if (e) {
                this.log("Failed to load the config file.", "warn");
                this.log(`The config file is located at ${this.paths.config}.`, "warn");
                this.log(e, "warn");
            }
            cb(null, conf, e);
            return conf;
        }
        conf = ul.deepMerge(conf, {});
        cb(null, conf);
        return conf;
    }

    /**
     * loadPlugins
     * Loads the provided plugins.
     *
     * @param  {Array} names The list of plugin names.
     * @param  {Function} cb The callback function.
     */
    loadPlugins (names, cb) {
        cb = cb || noop;
        return this.pluginLoader.loadAll(names, (err, data) => {
            this.emit("plugins-loaded", err, data, names);
            cb(err, data);
        });
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
        return this.pluginLoader.get(name, mod, cb);
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
        newLogLevel = parseInt(newLogLevel);
        if (!typpy(newLogLevel, Number)) {
            return this._log_level;
        }
        Logger.config.level = newLogLevel;
        return this._log_level = newLogLevel;
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
        newLine = deffy(newLine, true);
        type = deffy(type, "log");
        if (msg instanceof Error) {
            type = type || "error";
            msg = msg.stack;
        } else {
            msg = String(msg);
        }
        if (!stream) {
            Logger.log(msg, type);
            return;
        }
        if (newLine) {
            msg += "\n";
        }
        stream = type === "error" ? process.stderr : process.stdout;
        stream.write(msg);
    }

    extend (methods) {
        forEach(methods, (fn, c) => {
            this[c] = fn;
        });
    }
};
