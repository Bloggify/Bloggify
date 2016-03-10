"use strict";

const bloggifyPaths = require("bloggify-paths")
    , defaultConfig = require("./default-config")
    , ul = require("ul")
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
        this.paths = bloggifyPaths(root, options);
    }
    getConfig (cb) {
        let conf = defaultConfig;
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
};
