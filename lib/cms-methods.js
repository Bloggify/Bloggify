module.exports = {
    // Article-related functions
    /**
     * getArticleById
     * Gets a specific article, by id.
     *
     * @name getArticleById
     * @function
     * @param {String} id The article id.
     * @param {Object} opts An options object.
     * @param {Function} cb The callback function.
     */
    getArticleById (id, opts, cb) {
        return this.adapter.getArticleById(id, opts, cb);
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
  , getArticles (query, cb) {
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
  , createArticle (title, content, custom, cb) {
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
  , saveArticle (id, title, content, custom, cb) {
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
  , deleteArticle (id, cb) {
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
  , deleteArticles (ids, cb) {
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
  , getPageBySlug (slug, cb) {
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
  , getPages (query, cb) {
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
  , createPage (title, content, custom, cb) {
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
  , savePage (slug, title, content, custom, cb) {
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
  , deletePage (slug, cb) {
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
  , deletePages (slugs, cb) {
        this.emit("delete-pages", slugs);
        return this.adapter.deletePages(slugs, cb);
    }
};
