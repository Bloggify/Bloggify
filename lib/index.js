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
    constructor (options) {
        if (typeof options === "string") {
            options = { root: options };
        }
        options = ul.deepMerge(options, defaults);
        super(options.root, options);
        this.server = new Lien(options.server);
        this._serverLoaded = false;
        this._serverPort = options.server.port;
        this.server.on("load", (err, data) => {
            this._serverLoaded = [err, data];
        });
        if (options.loadPlugins !== false) {
            this.loadPlugins();
        }
        this.on("plugins-loaded", () => {
            this.firstRequests._called = true;
            this.firstRequests.forEach(c => c[2]());
        });
        let firstRequests = this._firstRequests = [];
        this.server.router.use(function (req, res, next) {
            if (firstRequests._called) {
                return next();
            }
            firstRequests.push([req, res, next]);
        });
    }
    onLoad (cb) {
        if (this._serverLoaded) {
            return cb(this._serverLoaded[0], this._serverLoaded[1]);
        }
        this.server.on("load", cb);
    }
};
