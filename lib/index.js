"use strict";

const BloggifyServer = require("bloggify-server")
    , defaultOptions = require("./options")
    , ul = require("ul")
    ;

module.exports = class Bloggify extends BloggifyServer {
    constructor (options) {

        if (typeof options === "string") {
            options = { root: options };
        }

        options = ul.deepMerge(options, defaultOptions);

        // The plugin manager will take care of loading the plugins
        // ...but we don't force it
        if (!options.loadPlugins) {
            options.loadPlugins = false;
        }

        super(options);

        let firstRequests = [];
        this.server.router.use(function (req, res, next) {
            if (firstRequests._called) {
                return next();
            }
            firstRequests.push([req, res, next]);
        });

        // Load the core plugins
        this.pluginLoader.loadAll(options.corePlugins, (err, data) => {
            console.log(err || data);
            firstRequests._called = true;
            firstRequests.forEach(c => c[2]());
        });
    }
};
