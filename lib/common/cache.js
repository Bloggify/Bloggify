var Cache = module.exports = {}
  , Marked = require("marked")
  , Highlight = require("highlight.js")
  ;

Highlight.configure({ classPrefix: '' });
Marked.setOptions({
    highlight: function (code) {
        return Highlight.highlightAuto(code).value;
    }
});

var fileCache = {
    buffer: []
};

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
      , loading: true
    };

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

Cache.post = function (m_query, m_options, options, callback) {

    // post(callback)
    if (typeof m_query === "function") {
        callback = m_query;
        m_query = {};
        m_options = {};
        options = { markdown: true };
    // post({}, callback)
    } else if (typeof m_options === "function") {
        callback = m_options;
        m_options = {};
        options = { markdown: true };
    // post({}, {}, callback)
    } else if (typeof options === "function") {
        callback = options;
        options = m_options;
        m_options = {};
    }

    if (!m_options.sort) {
        m_options.sort = { date: -1 };
    }

    function prepareData(posts, callback) {
        var length = posts.length
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

        function readFile(cPost) {

            if (options.noContent) {
                if (++complete === length) {
                    clb(null, posts);
                }
                return;
            }

            Cache.file(Bloggify.config.posts  + "/" + cPost.id + ".md"
                , { markdown: options.markdown }
                , function (err, content) {
                if (err) { return clb(err); }
                cPost.content = content;
                if (++complete === length) {
                    return clb(null, posts);
                }
            });
        }

        for (var i = 0; i < length; ++i) {
            var cPost = posts[i];
            cPost.date = new Date(cPost.date);
            cPost.url = Bloggify.config.blog.path + "/" + cPost.id + "-" + cPost.slug;
            readFile(cPost);
        }
    }

    Bloggify.posts.find(m_query, m_options).toArray(function (err, posts) {
        if (err) { return callback(err); }
        prepareData(posts, function (err) {
            if (err) { return callback(err); }
            callback(null, posts);
        });
    });
};
