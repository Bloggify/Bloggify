"use strict";

const bloggifyPaths = require("bloggify-paths")
    , PluginLoader = require("bloggify-plugin-loader")
    , EventEmitter = require("events").EventEmitter
    , ul = require("ul")
    , typpy = require("typpy")
    , deffy = require("deffy")
    , noop = require("noop6")
    , Logger = require("bug-killer")
    ;

module.exports = class BloggifyCore extends EventEmitter {
    /**
     * BloggifyCore
     * The Bloggify core library.
     *
     * @name BloggifyCore
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `fieldOne` (Number): Any number (default: `42`).
     *
     * @return BloggifyCore The `BloggifyCore` instance.
     */
    constructor (root, options) {

        const isProduction = process.env.NODE_ENV === "production";

        // Handle errors smoothly
        isProduction && process.on("uncaughtException", err => {
            this.log("Fatal error:", "error");
            this.log(err);
        });

        super();
        this.options = ul.deepMerge(options, {
            paths: {}
        });

        this.app = {};
        this.paths = bloggifyPaths(root, this.options, this);
        this.options = this.getConfig();
        this.paths.initPublicPaths();
        this.pluginLoader = new PluginLoader(this);
        this.production = isProduction;
        this.models = {};

        let logLevel = process.env.BLOGGIFY_LOG_LEVEL;
        if (this.production && !logLevel) {
            logLevel = 1;
        }
        this.logLevel(logLevel);
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
    require (name, mod) {
        return this.pluginLoader.get(name, mod);
    }

    // 0: Ignore everything
    // 1: Show errors
    // 2: Show errors + warnings
    // 3: Show errors + warnings + info
    // 4: Show everything (including logs)
    logLevel (newLogLevel) {
        newLogLevel = parseInt(newLogLevel);
        if (!typpy(newLogLevel, Number)) {
            return this._log_level;
        }
        Logger.config.level = newLogLevel;
        return this._log_level = newLogLevel;
    }

    // type: error|info|warn|log
    log (msg, type, stream, newLine) {
        newLine = deffy(newLine, true);
        type = deffy(type, "log");
        if (msg instanceof Error) {
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
};
