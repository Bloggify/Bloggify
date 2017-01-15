"use strict";

const BloggifyCore = require("bloggify-core")
    , ul = require("ul")
    , defaults = require("./defaults")
    , Lien = require("lien")
    , forEach = require("iterate-object")
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
    constructor (options) {
        if (typeof options === "string") {
            options = { root: options };
        }

        options = ul.deepMerge(options, defaults);
        super(options.root, options);

        const Bloggify = this;
        options = this.options;
        options.server.public = this.paths.getPublicPaths();

        this.server = new Lien(options.server);
        this._serverLoaded = false;
        this._serverPort = options.server.port;
        this.server.on("load", (err, data) => {
            this._serverLoaded = [err, data];
        });

        Lien.LienObj.prototype.render = function (tmpl, data) {
            return Bloggify.render(this, tmpl, data);
        };

        options.bundler = options.bundler || require("rucksack");

        this.Bundler = options.bundler;
        this.bundles = {};
        this.assets = this.createBundler();

        if (options.loadPlugins !== false) {
            this.loadPlugins();
        }

        let firstRequests = this._firstRequests = [];
        this.on("plugins-loaded", () => {
            Promise.all(Object.keys(this.bundles).map(c => {
                return this.bundles[c].bundle();
            })).then(() => {
                this.log(`The application is ready, running at ${this.options.metadata.domain}`);
                firstRequests._called = true;
                firstRequests.forEach(c => c[2]());
            });
        });

        this.server.router.use(function (req, res, next) {
            if (firstRequests._called) {
                return next();
            }
            firstRequests.push([req, res, next]);
        });
    }

    handleBundleConfig (bloggifyConfig, root) {
        if (!bloggifyConfig) { return; }
        let bundles = bloggifyConfig.bundles || {};
        forEach(bundles, (conf, name) => {
            let bndl = this.createBundler(name);
            if (!bndl) {
                this.log(new Error(`Bundle '${name}' does not exist.`));
            } else {
                bndl.add(conf, root);
            }
        });
        this.assets.add(bloggifyConfig, root);
    }

    createBundler (options) {
        options = options || "main";
        if (typeof options === "string") {
            let paths = this.paths.getBundlePaths(options);
            options = {
                jsOutput: paths.local.js
              , cssOutput: paths.local.css
              , jsUrl: paths.urls.js
              , cssUrl: paths.urls.css
              , name: options
            };
        }

        options = ul.merge(options, {
            development: !!~process.argv.indexOf("--production-bundle") ? false : !this.production
        });

        let existing = this.bundles[options.name];
        if (existing) {
            return existing;
        }

        return this.bundles[options.name] = new this.Bundler(options);
    }

    onLoad (cb) {
        if (this._serverLoaded) {
            return cb(this._serverLoaded[0], this._serverLoaded[1]);
        }
        this.server.on("load", cb);
    }
};
