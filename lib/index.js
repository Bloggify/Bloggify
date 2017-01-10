"use strict";

const ul = require("ul")
    , path = require("path")
    , deffy = require("deffy")
    , abs = require("abs")
    , iterateObject = require("iterate-object")
    ;

const defaultPaths = require("./defaults");

module.exports = class BloggifyPaths {

    /**
     * BloggifyPaths
     * Creates a new instance of `BloggifyPaths`.
     *
     * The instance contains the following fields:
     *
     *  - `publicUrls`: The url endpoints (accesible via HTTP)
     *    - `core`: The core public url.
     *    - `main`: The application public url.
     *    - `theme`: The theme public url.
     *    - `root`: The root public url.
     *
     *  - `public`: The file system paths.
     *    - `core`: The path to the core public directory.
     *    - `main`: The application public directory.
     *    - `theme`: The theme public directory.
     *    - `root`: The root public directory.
     *
     *  - `_bundles`: The relative bundle urls.
     *    - `js`: it takes the following value: `/js/index.js`
     *    - `css`: it takes the following value: `/css/index.css`
     *
     *  - `bundleUrls`: The bundle urls.
     *    - `js`: The absolute url of the js bundle.
     *    - `css`: The absolute url of the css bundle.
     *
     *  - `bundlePaths`: The bundle paths.
     *    - `js`: The absolute path of the js bundle.
     *    - `css`: The absolute path of the css bundle.
     *
     *  - `_publicPaths`: An array of pairs of url endpoints and disk paths.
     *
     * @param  {String} root The path to the application's root.
     * @param  {Object} options The Bloggify options. The `paths` object will be merged with the following defaults:
     *
     *  - `bloggify` (String): The bloggify directory (by default the root).
     *  - `config` (String): The configuration file path (default: `/bloggify.js`).
     *  - `plugins` (String): The path to the plugins directory (default: `/node_modules`)>
     *  - `publicMain` (String): The public main directory endpoint (default: `"/!/bloggify/public/"`).
     *  - `publicCore` (String): The public core directory endpoint (default: `"/!/bloggify/core/"`).
     *  - `publicTheme` (String): The public theme directory endpoint (default: `"/!/bloggify/theme/"`).
     *
     * @param  {Bloggify} bloggifyInstance The Bloggify instance.
     * @return {Object} The BloggifyPaths instance.
     */
    constructor (root, options, bloggifyInstance) {
        this.root = abs(root);
        this._ = bloggifyInstance;
        options = ul.deepMerge(options, {
            paths: {}
        });
        this._paths = ul.merge(options.paths, defaultPaths);
        this.prepare();
    }

    /**
     * initPublicPaths
     * Initializes the path values (documented above).
     */
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

    /**
     * getPublicPaths
     * Fetches the public paths of the app.
     *
     * @return {Array}  The public paths.
     */
    getPublicPaths () {
        return this._publicPaths;
    }

    /**
     * getMainPublic
     * Returns the path to the app's public directory/uri.
     *
     * @param  {Boolean} fromDisk Establishes the source of the public directory.
     * @return {String}           The public path.
     */
    getMainPublic (fromDisk) {
        return fromDisk ? this.public.main : this.publicUrls.main;
    }

    /**
     * getThemePublic
     * Returns the path to the theme's public directory/uri.
     *
     * @param  {Boolean} fromDisk Establishes the source of the public directory.
     * @return {String}           The public path.
     */
    getThemePublic (fromDisk) {
        return fromDisk ? this.public.them : this.publicUrls.theme;
    }

    /**
     * staticFilePath
     * Gets the url of a file.
     *
     * @param  {String} filePath The file path.
     * @param  {Boolean} absolute If `true`, the absolute path will be returned.
     * @return {String} The file url.
     */
    staticFilePath (filePath, absolute) {
        if (!filePath || typeof filePath !== "string") { return ""; }

        // We assume it's a remote url
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

    /**
     * prepare
     * Initializes the paths values.
     */
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

    /**
     * pluginPath
     * Fetches the path of the plugin.
     *
     * @param  {String} name The plugin's name.
     * @return {type}        The plugin's path.
     */
    pluginPath (name) {
        return path.join(this.plugins, name);
    }
};
