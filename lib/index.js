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

        // Load the core plugins
        this.loadPlugins(options.corePlugins, (err, data) => {
            console.log(err || data);
        });
    }
};
