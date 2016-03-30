"use strict";

const gitModuleInstaller = require("git-module-installer");

module.exports = class BloggifyPluginManager {
    static init (config, bloggify, ready) {
        bloggify.pluginManager = new BloggifyPluginManager(bloggify);
        bloggify.pluginManager.installAll(ready);
    }
    constructor (bloggify) {
        this.bloggify = bloggify;
        this._plugins = bloggify.config.plugins;
    }
    installAll (cb) {
        this.downloadAll((err, data) => {
            if (err) { return cb(err); }
                debugger
            // bloggify.pluginLoader.loadAll(plugins.map(c => c.name), ready);
        });
    }
    downloadAll (cb) {
        let pluginsToDownload = this._plugins.map(c => {
            source: c.source
          , path: c.path || c.name
        }).filter(c => c.source);
        debugger
        if (!plugins.length) { return; }
    }
};

