"use strict"

const ul = require("ul")
    , path = require("path")
    , deffy = require("deffy")
    , abs = require("abs")
    , iterateObject = require("iterate-object")
    , mkdirp = require("mkdirp")


const DOT_BLOGGIFY = ".bloggify"

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
     *    - `root`: The root public url.
     *
     *  - `public`: The file system paths.
     *    - `core`: The path to the core public directory.
     *    - `main`: The application public directory.
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
     *
     * @param  {Bloggify} bloggifyInstance The Bloggify instance.
     * @return {Object} The BloggifyPaths instance.
     */
    constructor (root, options, bloggifyInstance) {
        this.root = abs(root)
        this._ = bloggifyInstance
        options = ul.deepMerge(options, {
            paths: {}
        })
        this.isProduction = process.env.NODE_ENV === "production"
        this.envLabel = this.isProduction ? "production" : "development"
        this._paths = options.paths
        this.prepare()
    }

    /**
     * initPublicPaths
     * Initializes the path values (documented above).
     */
    initPublicPaths () {

        this.publicUrls = {
            core: this._paths.publicCore
          , main: this._paths.publicMain
          , root:"/"
        }

        this.public = {
            core: `${this.root}/${DOT_BLOGGIFY}/public`
          , main: `${this.root}/${this._.options.server.public}`
          , root: `${this.root}/_${this._.options.server.public}`
        }

        const customStaticPaths = Array.isArray(this._.options.static_dirs) ? this._.options.static_dirs : []
        this._publicPaths = [
            ...customStaticPaths
          , [this.publicUrls.main, this.public.main]
          , [this.publicUrls.core, this.public.core]
          , [this.publicUrls.root, this.public.root]
        ]

        this.bundleCacheDir = `${this.root}/${DOT_BLOGGIFY}/${this.envLabel}-bundle-cache`
        this.cssUrlMap = `${this.root}/${DOT_BLOGGIFY}/${this.envLabel}-css-urls.json`
        mkdirp.sync(this.bundleCacheDir)
    }

    /**
     * getBundlePaths
     * Get the bundle paths for a bundle name.
     *
     * @name getBundlePaths
     * @function
     * @param {String} name The bundle name (default: `main`).
     * @returns {Object} An object containing the following fields:
     *
     *  - `urls`: The URL endpoints.
     *    - `js` (String): The JavaScript bundle url.
     *    - `css` (String): The CSS bundle url.
     *
     *  - `local`: The local paths.
     *    - `js` (String): The JavaScript bundle local path.
     *    - `css` (String): The CSS bundle local path.
     */
    getBundlePaths (name) {
        name = name || "main"

        const bundles = {
            js: `/${this.envLabel}-bundles/${name}/scripts-${name}.js`
          , css: `/${this.envLabel}-bundles/${name}/stylesheets-${name}.css`
        }

        return {
            urls: {
                js: `${this.publicUrls.core}${bundles.js}`
              , css: `${this.publicUrls.core}${bundles.css}`
            }
          , local: {
                js: `${this.public.core}${bundles.js}`
              , css: `${this.public.core}${bundles.css}`
            }
          , cacheFile: `${this.bundleCacheDir}/${name}.json`
        }
    }

    /**
     * getPublicPaths
     * Fetches the public paths of the app.
     *
     * @return {Array}  The public paths.
     */
    getPublicPaths () {
        return this._publicPaths
    }

    /**
     * getMainPublic
     * Returns the path to the app's public directory/uri.
     *
     * @param  {Boolean} fromDisk Establishes the source of the public directory.
     * @return {String}           The public path.
     */
    getMainPublic (fromDisk) {
        return fromDisk ? this.public.main : this.publicUrls.main
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
            return filePath
        }

        if (absolute) {
            return this._.options.metadata.domain + this.staticFilePath(filePath)
        }

        // Main Public
        if (filePath.charAt(0) === "/") {
            return path.normalize(`${this.publicUrls.main}/${filePath}`)
        }

        throw new Error("Invalid path: " + filePath)
    }

    /**
     * prepare
     * Initializes the paths values.
     */
    prepare () {
        this.bloggify = path.join(this.root, this._paths.bloggify)
        iterateObject(this._paths, (value, pathName) => {
            if (pathName === "bloggify" || pathName === "root" || typeof this[pathName] === "function") { return; }
            this[pathName] = value.startsWith("/")
                           ? path.join(this.root, value)
                           : path.join(this.bloggify, value)

        })
    }

    /**
     * pluginPath
     * Fetches the path of the plugin.
     *
     * @param  {String} name The plugin's name.
     * @return {type}        The plugin's path.
     */
    pluginPath (name) {
        return path.join(this.plugins, name)
    }
}
