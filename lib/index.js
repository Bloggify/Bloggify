"use strict";

const BloggifyServer = require("bloggify-server")
    , defaultOptions = require("./options")
    , ul = require("ul")
    ;

module.exports = class Bloggify extends BloggifyServer {
    constructor (options, adapter) {

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

        this.adapter = adapter || options.adapter;

        // Load the core plugins
        this.loadPlugins(options.corePlugins, (err, data) => {
            console.log(err || data);
        });
    }

    // Article-related functions
    getArticleById (id, cb) {
        return this.adapter.getArticleById(id, cb);
    }

    getArticles (query, cb) {
        return this.adapter.getArticles(cb);
    }

    createArticle (title, content, custom, cb) {
        return this.adapter.createArticle(title, content, custom, cb);
    }

    saveArticle (id, title, content, custom, cb) {
        return this.adapter.saveArticle(id, title, content, custom, cb);
    }

    deleteArticle (id, cb) {
        return this.adapter.deleteArticle(id, cb);
    }

    deleteArticles (ids, cb) {
        return this.adapter.deleteArticles(ids, cb);
    }

    // Pages-related functions
    getPageBySlug (slug, cb) {
        return this.adapter.getPageBySlug(slug, cb);
    }

    getPages (query, cb) {
        return this.adapter.getPages(query, cb);
    }

    createPage (title, content, custom, cb) {
        return this.adapter.createPage(title, content, custom, cb);
    }

    savePage (title, content, custom, cb) {
        return this.adapter.savePage(title, content, custom, cb);
    }

    deletePage (slug, cb) {
        return this.adapter.deletePage(slug, cb);
    }

    deletePages (slugs, cb) {
        return this.adapter.deletePages(slugs, cb);
    }
};
