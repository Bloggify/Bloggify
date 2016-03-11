"use strict";

const ul = require("ul")
    , path = require("path")
    , deffy = require("deffy")
    , abs = require("abs")
    , iterateObject = require("iterate-object")
    ;

const defaultPaths = require("./defaults")

class BloggifyPaths {

    constructor (root, options) {
        this.root = abs(root);
        options = ul.deepMerge(options, {
            paths: {}
        });
        this._paths = ul.merge(options.paths, defaultPaths);
        this.prepare();
    }

    prepare () {
        this.bloggify = path.join(this.root, this._paths.bloggify);
        iterateObject(this._paths, (value, pathName) => {
            if (pathName === "bloggify" || pathName === "root" || typeof this[pathName] === "function") { return; }
            this[pathName] = path.join(this.bloggify, value);
        });
    }

    pluginPath (name) {
        return path.join(this.plugins, name);
    }

    pluginConfigPath (name) {
        return path.join(this.pluginConfigs, name);
    }
};

/**
 * bloggifyPaths
 * Helper library for maintaining the Bloggify paths in one place.
 *
 * @name bloggifyPaths
 * @function
 * @return {Number} Return description.
 */
module.exports = function bloggifyPaths (root, options) {
    return new BloggifyPaths(root, options);
};

module.exports.BloggifyPaths = BloggifyPaths;
