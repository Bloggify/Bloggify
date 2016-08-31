"use strict";

const bloggifyPaths = require("bloggify-paths")
    , PluginLoader = require("bloggify-plugin-loader")
    , EventEmitter = require("events").EventEmitter
    , ul = require("ul")
    , typpy = require("typpy")
    , deffy = require("deffy")
    , noop = require("noop6")
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

        // Handle errors smoothly
        process.on("uncaughtException", err => {
            this.log("Fatal error:", "error");
            this.log(err);
        });

        super();
        this.options = ul.deepMerge(options, {
            paths: {}
        });
        this.app = {};
        this.paths = bloggifyPaths(root, this.options, this);
        this.pluginLoader = new PluginLoader(this);
        this.production = process.env.NODE_ENV === "production";
        this.options = this.getConfig();
        let logLevel = process.env.BLOGGIFY_LOG_LEVEL;
        if (this.production && !logLevel) {
            logLevel = 1;
        }
        this.logLevel(logLevel);
    }

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
            cb(null, conf, e);
            return conf;
        }
        conf = ul.deepMerge(conf, {});
        cb(null, conf);
        return conf;
    }

    loadPlugins (names, cb) {
        cb = cb || noop;
        return this.pluginLoader.loadAll(names, (err, data) => {
            this.emit("plugins-loaded", err, data, names);
            cb(err, data);
        });
    }

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
        return this._log_level = newLogLevel;
    }

    // type: error|info|warn|log
    log (msg, type, stream, newLine) {
        newLine = deffy(newLine, true);
        type = deffy(type, "log");
        if (!stream) {
            stream = type === "error" ? process.stderr : process.stdout;
        }
        if (msg instanceof Error) {
            msg = msg.stack;
        } else {
            msg = String(msg);
        }
        if (newLine) {
            msg += "\n";
        }
        stream.write(msg);
    }
};
