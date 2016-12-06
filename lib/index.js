"use strict";

const ul = require("ul")
    , path = require("path")
    , deffy = require("deffy")
    , abs = require("abs")
    , iterateObject = require("iterate-object")
    ;

const defaultPaths = require("./defaults")

class BloggifyPaths {

    constructor (root, options, bloggifyInstance) {
        this.root = abs(root);
        this._ = bloggifyInstance;
        options = ul.deepMerge(options, {
            paths: {}
        });
        this._paths = ul.merge(options.paths, defaultPaths);
        this.prepare();
    }

    initPublicPaths () {

        this.publicUrls = {
            core:this._paths.publicCore
          , main: this._paths.publicMain
          , theme:this._paths.publicTheme
          , root:"/"
        };

        this.public = {
            core: `${this.root}/.bloggify/public`
          , main: `${this.root}/${this._.options.server.public}`
          , theme: `${this.root}/${this._paths.bloggify}/${this._.options.theme.path}/${this._.options.theme.public}`
          , root: `${this.root}/_${this._.options.server.public}`
        };

        this._bundles = {
            js: `/js/index.js`
          , css: `/css/index.css`
        };

        this.bundleUrls = {
            js: `${this.publicUrls.core}${this._bundles.js}`
          , css: `${this.publicUrls.core}${this._bundles.css}`
        };

        this.bundlePaths = {
            js: `${this.public.core}${this._bundles.js}`
          , css: `${this.public.core}${this._bundles.css}`
        };

        this._publicPaths = [
            [this.publicUrls.main, this.public.main]
          , [this.publicUrls.core, this.public.core]
          , [this.publicUrls.theme, this.public.theme]
          , [this.publicUrls.root, this.public.root]
        ];
    }

    getPublicPaths () {
        return this._publicPaths;
    }

    getMainPublic (fromFs) {
        return fromFs ? this._publicPaths[0][1] : this._publicPaths[0][0];
    }

    getThemePublic (fromFs) {
        return fromFs ? this._publicPaths[0][1] : this._publicPaths[0][0];
    }

    staticFilePath (filePath, absolute) {
        if (!filePath || typeof filePath !== "string") { return ""; }
        if (filePath.includes(":")) {
            return filePath;
        }
        if (absolute) {
            return this._.options.metadata.domain + this.staticFilePath(filePath);
        }
        // Main Public
        if (filePath.charAt(0) === "/") {
            return path.normalize(`${this.publicUrls.main}/${filePath}`);
        }

        // Theme public
        return path.normalize(`${this.publicUrls.theme}/${filePath}`);
    }

    prepare () {
        this.bloggify = path.join(this.root, this._paths.bloggify);
        iterateObject(this._paths, (value, pathName) => {
            if (pathName === "bloggify" || pathName === "root" || typeof this[pathName] === "function") { return; }
            this[pathName] = value.startsWith("/")
                           ? path.join(this.root, value)
                           : path.join(this.bloggify, value)
                           ;
        });
    }

    pluginPath (name) {
        return path.join(this.plugins, name);
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
module.exports = function bloggifyPaths (root, options, bloggify) {
    return new BloggifyPaths(root, options, bloggify);
};

module.exports.BloggifyPaths = BloggifyPaths;
