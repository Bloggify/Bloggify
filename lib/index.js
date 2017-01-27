"use strict";

const BloggifyServer = require("bloggify-server")
    , defaultOptions = require("./options")
    , ul = require("ul")
    , mapO = require("map-o")
    , readJson = require("safe-r-json")
    ;

module.exports = class Bloggify extends BloggifyServer {

    /**
     * Bloggify
     * Creates a new instance of `Bloggify`.
     *
     * @name Bloggify
     * @function
     * @param {Object} options An object containing the following fields:
     *
     *  - `loadPlugins`: false
     *  - `plugins`: plugins to load
     *  - `pluginConfigs`: plugin configs
     *  - `metadata`:
     *       - `siteTitle`: the site title
     *       - `siteDescription`: the site title
     *       - `domain`: the site domain
     *  - `corePlugins`: `[ "bloggify-plugin-manager", "bloggify-router" ]`
     *  - `server`: The lien settings.
     *  - `theme`:
     *       - `path`: the theme path (default: `"theme"`)
     *       - `public`: the theme public directory (default: `"public"`)
     *  - `adapter`: Adapter settings
     *       - `paths`:
     *              - `articles`: the path to the articles dir (default: `"content/articles"`)
     *              - `pages`: the path to the pages dir (default: `"content/pages"`)
     *
     * @param {BloggifyAdapter} adapter A custom content adapter.
     * @returns {Bloggify} The `Bloggify` instance.
     */
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
        this.package = readJson(`${this.paths.root}/package.json`);
        this.handleBundleConfig(this.package.bloggify, this.paths.root);

        mapO(options.adapter.paths, value => `${this.paths.root}/${value}`);

        // Normalize the adapter paths
        options.Adapter = options.Adapter || adapter || require("bloggify-markdown-adapter");
        options.Viewer = options.viewer || require("bloggify-theme-renderer");

        this.adapter = new options.Adapter(this);
        this.viewer = new options.Viewer(this);

        this.options.metadata.title = this.options.metadata.title || this.options.metadata.siteTitle;
        if (!this.options.metadata.domain) {
            this.log("Warning: Please provide your website domain in metadata.", "warn");
        }

        // Load the core plugins
        this.log("Loading the core plugins", "info");
        this.loadPlugins(options.corePlugins, (err, data) => {
            if (err) {
                this.log("Failed to initialize the plugins.", "error");
                this.log(err, "error");
            } else {
                this.log("Initialized plugins.");
            }
        });
    }

    /**
     * render
     * Renders a template.
     *
     * @name render
     * @function
     * @param {Lien} lien The `lien` object.
     * @param {String} templateName The template name or path.
     * @param {Object} data The template data.
     */
    render (lien, templateName, data) {

        data = data || {};

        data = ul.merge(data, {
            Bloggify: this
          , lien: lien
          , template: templateName
          , siteMetadata: this.options.metadata || {}
          , page: data.page || {}
          , _public: (filePath, absolute) => this.paths.staticFilePath(filePath, absolute)
          , f (i) { return i in this; }
          , stringify () {
                return JSON.stringify.apply(JSON, arguments).replace(/\//g, "\\u002f");
            }
        });

        if (data.error) {
            data.error.statusCode = data.error.statusCode || (
                /not found|enoent/i.test(data.error.message) ? 404 : 500
            );
            if (!data.forceTemplateName) {
                templateName = data.error.statusCode.toString();
            }
        }

        data.title = data.title || data.page.title || "";

        this.viewer.render(lien, templateName, data);
    }

    /**
     * registerRouter
     * Registers a new router.
     *
     * @name registerRouter
     * @function
     * @param {BloggifyRouter} router The Bloggify router to register.
     */
    registerRouter (router) {
        if (this.router) {
            throw new Error("There is already a registered router.");
        }
        this.router = router;
    }

    // Article-related functions
    /**
     * getArticleById
     * Gets a specific article, by id.
     *
     * @name getArticleById
     * @function
     * @param {String} id The article id.
     * @param {Function} cb The callback function.
     */
    getArticleById (id, cb) {
        return this.adapter.getArticleById(id, cb);
    }

    /**
     * getArticles
     * Get multiple articles.
     *
     * @name getArticles
     * @function
     * @param {Object} query The query.
     * @param {Function} cb The callback function.
     */
    getArticles (query, cb) {
        return this.adapter.getArticles(query, cb);
    }

    /**
     * createArticle
     * Create a new article.
     *
     * @name createArticle
     * @function
     * @param {String} title The article title.
     * @param {String} content The article content.
     * @param {Object} custom Custom data.
     * @param {Function} cb The callback function.
     */
    createArticle (title, content, custom, cb) {
        this.emit("create-article", title, content, custom);
        return this.adapter.createArticle(title, content, custom, cb);
    }

    /**
     * saveArticle
     * Saves an existing article.
     *
     * @name saveArticle
     * @function
     * @param {String} id The article id.
     * @param {String} title The article title.
     * @param {String} content The article content.
     * @param {Object} custom Custom data.
     * @param {Function} cb The callback function.
     */
    saveArticle (id, title, content, custom, cb) {
        this.emit("save-article", id, title, content, custom);
        return this.adapter.saveArticle(id, title, content, custom, cb);
    }

    /**
     * deleteArticle
     * Delete an article.
     *
     * @name deleteArticle
     * @function
     * @param {String} id The article id.
     * @param {Function} cb The callback function.
     */
    deleteArticle (id, cb) {
        this.emit("delete-article", id);
        return this.adapter.deleteArticle(id, cb);
    }

    /**
     * deleteArticles
     * Delete multiple articles.
     *
     * @name deleteArticles
     * @function
     * @param {Array} ids A list of ids.
     * @param {Function} cb The callback function.
     */
    deleteArticles (ids, cb) {
        this.emit("delete-articles", ids);
        return this.adapter.deleteArticles(ids, cb);
    }

    // Pages-related functions
    /**
     * getPageBySlug
     * Get a page by the slug.
     *
     * @name getPageBySlug
     * @function
     * @param {String} slug The page slug.
     * @param {Function} cb The callback function.
     */
    getPageBySlug (slug, cb) {
        return this.adapter.getPageBySlug(slug, cb);
    }

    /**
     * getPages
     * Get multiple pages.
     *
     * @name getPages
     * @function
     * @param {Object} query The query object.
     * @param {Function} cb The callback function.
     */
    getPages (query, cb) {
        return this.adapter.getPages(query, cb);
    }

    /**
     * createPage
     * Create a new page.
     *
     * @name createPage
     * @function
     * @param {String} title The article title.
     * @param {String} content The article content.
     * @param {Object} custom Custom data.
     * @param {Function} cb The callback function.
     */
    createPage (title, content, custom, cb) {
        this.emit("create-page", title, content, custom);
        return this.adapter.createPage(title, content, custom, cb);
    }

    /**
     * savePage
     * Saves a page.
     *
     * @name savePage
     * @function
     * @param {String} title The article title.
     * @param {String} content The article content.
     * @param {Object} custom Custom data.
     * @param {Function} cb The callback function.
     */
    savePage (slug, title, content, custom, cb) {
        this.emit("save-page", slug, title, content, custom);
        return this.adapter.savePage(slug, title, content, custom, cb);
    }

    /**
     * deletePage
     * Delete a page.
     *
     * @name deletePage
     * @function
     * @param {String} slug The page slug.
     * @param {Function} cb The callback function.
     */
    deletePage (slug, cb) {
        this.emit("delete-page", slug);
        return this.adapter.deletePage(slug, cb);
    }

    /**
     * deletePages
     * Delete multiple pages.
     *
     * @name deletePages
     * @function
     * @param {Array} slugs An array of slugs.
     * @param {Function} cb The callback function.
     */
    deletePages (slugs, cb) {
        this.emit("delete-pages", slugs);
        return this.adapter.deletePages(slugs, cb);
    }
};
