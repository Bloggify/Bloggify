"use strict";

const ul = require("ul")
    , path = require("path")
    , deffy = require("deffy")
    , abs = require("abs")
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
        this.config = path.join(this.bloggify, this._paths.config);
        this.plugins = path.join(this.bloggify, this._paths.plugins);
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
