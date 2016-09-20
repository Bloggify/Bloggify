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

        this._publicPaths = [
            [this._paths.publicMain, `${this.root}/${options.server.public}`]
          , [this._paths.publicTheme, `${this.root}/${this._paths.bloggify}/${options.theme.path}/${options.theme.public}`]
          , ["/", `${this.root}/_${options.server.public}`]
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
        if (filePath.includes(":")) {
            return filePath;
        }
        if (absolute) {
            return this._.options.metadata.domain + this.staticFilePath(filePath);
        }
        if (filePath.charAt(0) === "/") {
            return path.normalize(`${this._publicPaths[0][0]}/${filePath}`);
        }
        return path.normalize(`${this._publicPaths[1][0]}/${filePath}`);
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
module.exports = function bloggifyPaths (root, options, bloggify) {
    return new BloggifyPaths(root, options, bloggify);
};

module.exports.BloggifyPaths = BloggifyPaths;
