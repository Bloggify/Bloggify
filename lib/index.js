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
        iterateObject(this._paths, (value, pathName) => {
            if (typeof this[pathName] !== "string") { return; }
            this[pathName] = path.join(this.root, value);
        });
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
