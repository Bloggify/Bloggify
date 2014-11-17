// Dependencies
var Cache = module.exports = {}
  , Marked = require("marked")
  , Highlight = require("highlight.js")
  , Fs = require("fs")
  ;

// Configure highlight
Highlight.configure({ classPrefix: '' });
Marked.setOptions({
    highlight: function (code) {
        return Highlight.highlightAuto(code).value;
    }
});


var fileCache = { buffer: [] };
Cache.file = function (relPath, options, callback) {

    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    if (fileCache[relPath]) {
        if (fileCache[relPath].loading) {
            fileCache[relPath].buffer = fileCache[relPath].buffer || [];
            fileCache[relPath].buffer.push(callback);
            return;
        } else {
            clearTimeout(fileCache[relPath].expire);
            fileCache[relPath].expire = function () {
                setTimeout(function () {
                    delete fileCache[relPath];
                }, Bloggify.config.cache.ttl);
            };
            return callback(null, fileCache[relPath][options.markdown === true ? "markdown" : "content"]);
        }
    }

    fileCache[relPath] = {
        buffer: [callback]
      , watch: Fs.watch(Bloggify.server._sServer._root + relPath, function (event) {
            if (!fileCache[relPath]) { return; }
            if (event === "change") {
                readFile();
            }
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
