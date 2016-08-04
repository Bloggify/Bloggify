"use strict";

const BloggifyServer = require("bloggify-server")
    , defaultOptions = require("./options")
    , ul = require("ul")
    , mapO = require("map-o")
    ;

module.exports = class Bloggify extends BloggifyServer {

    constructor (options, adapter) {

        options = options || process.cwd();

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
        options = this.options;

        mapO(options.adapter.paths, value => `${this.paths.root}/${value}`);

        // Normalize the adapter paths

        options.Adapter = options.Adapter || adapter || require("bloggify-markdown-adapter");
        options.viewer = options.viewer || require("bloggify-theme-renderer");

        this.adapter = new options.Adapter(this);
        this.viewer = new options.viewer(this);
        this.viewer.render = this.viewer.render || (lien => {
            lien.end("The renderer plugin should override `bloggify.viewer.render` to be able to render the templates.", 500);
        });

        // Load the core plugins
        this.loadPlugins(options.corePlugins, (err, data) => {
            console.log(err || data);
        });
    }

    render (lien, templateName, data) {

        data = ul.merge(data, {
            Bloggify: this
          , lien: lien
          , template: templateName
          , siteMetadata: this.options.config.metadata || {}
          , content: data.content || data.article || {
                metadata: {
                    title: templateName
                }
            }
          , _public: filePath => this.paths.staticFilePath(filePath)
        });

        data.title = data.content.metadata.title;

        return this.viewer.getTemplatePath(templateName, (err, path) => {
            if (err) { return lien.end("Failed to get the template.", 500); }
            this.viewer.render(lien, path, data, err => {
                if (err) {
                    return this.log(err);
                }
            });
        });
    }

    registerRouter (router) {
        if (this.router) {
            throw new Error("There is already a registered router.");
        }
        this.router = router;
    }

    // Article-related functions
    getArticleById (id, cb) {
        return this.adapter.getArticleById(id, cb);
    }

    getArticles (query, cb) {
        return this.adapter.getArticles(query, cb);
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
