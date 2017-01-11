"use strict";

const BloggifyCore = require("bloggify-core")
    , ul = require("ul")
    , defaults = require("./defaults")
    , Lien = require("lien")
    ;

/**
 * bloggifyServer
 * The Bloggify server.
 *
 * @name bloggifyServer
 * @function
 * @param {Number} a Param descrpition.
 * @param {Number} b Param descrpition.
 * @return {Number} Return description.
 */
module.exports = class BloggifyServer extends BloggifyCore {

    /**
     * BloggifyServer
     * Creates a new instance of `BloggifyServer`.
     *
     * @param  {Object} options The Bloggify options.
     * @return {Object}         The BloggifyServer instance.
     */
    constructor (options) {
        if (typeof options === "string") {
            options = { root: options };
        }

        options = ul.deepMerge(options, defaults);
        super(options.root, options);

        options = this.options;
        options.server.public = this.paths.getPublicPaths();

        this.server = new Lien(options.server);
        this._serverLoaded = false;
        this._serverPort = options.server.port;
        this.server.on("load", (err, data) => {
            this._serverLoaded = [err, data];
        });

        options.bundler = options.bundler || require("rucksack");

        this.assets = new options.bundler({
            jsOutput: this.paths.bundlePaths.js
          , cssOutput: this.paths.bundlePaths.css
          , jsUrl: this.paths.bundleUrls.js
          , cssUrl: this.paths.bundleUrls.css
          , development: !!~process.argv.indexOf("--production-bundle") ? false : !this.production
        });

        if (options.loadPlugins !== false) {
            this.loadPlugins();
        }

        let firstRequests = this._firstRequests = [];
        this.on("plugins-loaded", () => {
            this.assets.bundle();
            firstRequests._called = true;
            firstRequests.forEach(c => c[2]());
        });

        this.server.router.use(function (req, res, next) {
            if (firstRequests._called) {
                return next();
            }
            firstRequests.push([req, res, next]);
        });
    }

    /**
     * onLoad
     * Checkes if the server is loaded.
     *
     * @param  {Funcion} cb The callback function.
     */
    onLoad (cb) {
        if (this._serverLoaded) {
            return cb(this._serverLoaded[0], this._serverLoaded[1]);
        }
        this.server.on("load", cb);
    }
};
