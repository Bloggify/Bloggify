"use strict";

const bloggifyPaths = require("bloggify-paths")
    , PluginLoader = require("bloggify-plugin-loader")
    , defaultConfig = require("./default-config")
    , ul = require("ul")
    , typpy = require("typpy")
    , deffy = require("deffy")
    ;

module.exports = class BloggifyCore {
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
        this.options = ul.deepMerge(options, {
            config: {}
          , paths: {}
        });
        this.paths = bloggifyPaths(root, this.options);
        this.pluginLoader = new PluginLoader(this);
        this.production = process.env.NODE_ENV === "production";
        let logLevel = process.env.BLOGGIFY_LOG_LEVEL;
        if (this.production && !logLevel) {
            logLevel = 1;
        }
        this.logLevel(logLevel);
    }

    getConfig (cb) {
        let conf = ul.deepMerge(this.options.config, defaultConfig);
        try {
            conf = require(this.paths.config);
        } catch (e) {
            if (e.code !== "MODULE_NOT_FOUND") {
                return cb(e, conf);
            }
            return cb(null, conf, e);
        }
        conf = ul.deepMerge(conf, defaultConfig);
        return cb(null, conf);
    }

    loadPlugins (names, cb) {
        return this.pluginLoader.loadAll(names, cb);
    }

    getPlugin (name, mod) {
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
        stream.write(msg);
    }
};
