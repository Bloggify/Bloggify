// Dependencies
var Cache = module.exports = {}
  , Marked = require("marked")
  , Highlight = require("highlight.js")
  , Fs = require("fs")
  , Watch = require("fwatcher")
  ;

// Configure highlight
Highlight.configure({ classPrefix: '' });
Marked.setOptions({
    highlight: function (code) {
        return Highlight.highlightAuto(code).value;
    }
});

// File cache
var fileCache = { buffer: [] };

/**
 * file
 * Returns the contents of a file from cache (and cache the file if it was not cached).
 *
 * @name file
 * @function
 * @param {String} relPath The relative path to the file.
 * @param {Object} options An object containing the following fields:
 *  - `markdown` (Boolean): A flag to mention if the file should be parsed as markdown (default: `false`).
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Cache.file = function (relPath, options, callback) {

    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    // From cache
    if (fileCache[relPath]) {
        if (fileCache[relPath].loading) {
            fileCache[relPath].buffer = fileCache[relPath].buffer || [];
            fileCache[relPath].buffer.push(callback);
        } else {
            clearTimeout(fileCache[relPath].expire);
            fileCache[relPath].expire = function () {
                setTimeout(function () {
                    delete fileCache[relPath];
                }, Bloggify.config.cache.ttl);
            };
            callback(null, fileCache[relPath][options.markdown === true ? "markdown" : "content"]);
        }
        return;
    }

    // Start caching
    fileCache[relPath] = {
        buffer: [callback]
      , watch: Watch(Bloggify.server._sServer._root + relPath, function (err) {
            if (err) { return Bloggify.log(err, "error"); }
            if (!fileCache[relPath]) { return; }
            readFile();
        })
    };

    readFile();

    function readFile() {
        if (Object(fileCache[relPath]).loading === true) {
            return;
        }
        fileCache[relPath].loading = true;
        Bloggify.server._sServer.readFile(relPath, function (err, data) {

            var callbacks = function (e, d) {
                for (var i = 0; i < fileCache[relPath].buffer.length; ++i) {
                    fileCache[relPath].buffer[i](e, d);
                }
                fileCache[relPath].buffer = [];
            };

            if (err) {
                callbacks(err);
                delete fileCache[relPath];
                return;
            }

            fileCache[relPath].loading = false;
            fileCache[relPath].markdown = Marked.parse(data);
            fileCache[relPath].content = data;

            fileCache[relPath].expire = function () {
                setTimeout(function () {
                    delete fileCache[relPath];
                }, Bloggify.config.cache.ttl);
            };

            callbacks(null, fileCache[relPath][options.markdown === true ? "markdown" : "content"]);
        });
    }
};

/**
 * page
 * Queries the pages.
 *
 * @name page
 * @function
 * @param {Object} m_query The Mongo query (default: `{}`).
 * @param {Object} m_options The Mongo options (default: `{}`).
 * @param {Object} options An object containing the following fields:
 *
 *  - `noContent` (Boolean): A flag if the content should be returned or not (default: `true`).
 *  - `markdown` (Boolean): A flag to mention if the response should be parsed as markdown (default: `false`).
 *  - `noBlog` (Boolean): A flag to ignore or not the blog page (default: `false`).
 *
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Cache.page = function (m_query, m_options, options, callback) {

    // page(callback);
    if (typeof m_query === "function") {
        callback = m_query;
        m_query = {};
        m_options = {};
        options = { noContent: true };
    // page({}, callback);
    } else if (typeof m_options === "function") {
        callback = m_options;
        m_options = {};
        options = { noContent: true };
    // page({}, {}, callback);
    } else if (typeof options === "function") {
        callback = options;
        options = m_options;
        m_options = {};
    }

    function prepareData(data, callback) {
        var length = data.length
          , complete = 0
          , already = false
          ;

        if (!length) {
            return callback(null, []);
        }

        function clb(err, res) {
            if (already) { return; }
            callback(err, res);
        }

        function readFile(cData) {

            if (options.noContent) {
                if (++complete === length) {
                    callback(null, data);
                }
                return;
            }

            Cache.file(Bloggify.config.pages  + "/" + cData.slug + ".md"
                , { markdown: options.markdown }
                , function (err, content) {
                if (err) { return clb(err); }
                cData.content = content;
                if (++complete === length) {
                    return callback(null, data);
                }
            });
        }

        for (var i = 0; i < length; ++i) {
            readFile(data[i]);
        }
    }

    Bloggify.pages.find(m_query, m_options).toArray(function (err, pages) {
        if (err) { return callback(err); }
        prepareData(pages, function (err) {
            if (err) { return callback(err); }
            if (options.noBlog !== true) {
                pages.push(Bloggify.config.blog);
                pages.sort(function (a, b) {
                    return a.order > b.order;
                });
            }
            callback(null, pages);
        });
    });
};

/**
 * article
 * Queries the articles.
 *
 * @name articles
 * @function
 * @param {Object} m_query The Mongo query (default: `{}`).
 * @param {Object} m_options The Mongo options (default: `{}`).
 * @param {Object} options An object containing the following fields:
 *
 *  - `noContent` (Boolean): A flag if the content should be returned or not (default: `true`).
 *  - `markdown` (Boolean): A flag to mention if the response should be parsed as markdown (default: `false`).
 *  - `noBlog` (Boolean): A flag to ignore or not the blog page (default: `false`).
 *
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Cache.article = function (m_query, m_options, options, callback) {

    // article(callback)
    if (typeof m_query === "function") {
        callback = m_query;
        m_query = {};
        m_options = {};
        options = { markdown: true };
    // article({}, callback)
    } else if (typeof m_options === "function") {
        callback = m_options;
        m_options = {};
        options = { markdown: true };
    // article({}, {}, callback)
    } else if (typeof options === "function") {
        callback = options;
        options = m_options;
        m_options = {};
    }

    if (!m_options.sort) {
        m_options.sort = { date: -1 };
    }

    function prepareData(articles, callback) {
        var length = articles.length
          , complete = 0
          , already = false
          ;

        if (!length) {
            return callback(null, []);
        }

        function clb(err, data) {
            if (already) { return; }

            callback(err, data);
        }

        function readFile(cData) {

            if (options.noContent) {
                if (++complete === length) {
                    clb(null, articles);
                }
                return;
            }

            Cache.file(Bloggify.config.articles  + "/" + cData.id + ".md"
                , { markdown: options.markdown }
                , function (err, content) {
                if (err) { return clb(err); }
                cData.content = content;
                if (++complete === length) {
                    return clb(null, articles);
                }
            });
        }

        for (var i = 0; i < length; ++i) {
            var cData = articles[i];
            cData.date = new Date(cData.date);
            cData.url = Bloggify.config.blog.path + "/" + cData.id + "-" + cData.slug;
            readFile(cData);
        }
    }

    Bloggify.articles.find(m_query, m_options).toArray(function (err, articles) {
        if (err) { return callback(err); }
        prepareData(articles, function (err) {
            if (err) { return callback(err); }
            callback(null, articles);
        });
    });
};
