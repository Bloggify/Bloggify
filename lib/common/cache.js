var Cache = module.exports = {}
  , Marked = require("marked")
  , Highlight = require("highlight.js")
  , Moment = require("moment")
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

Cache.page = function (query, options, callback) {

    if (typeof query === "function") {
        callback = query;
        options = {};
        query = {};
    } else if (typeof options === "function") {
        callback = options;
        options = {};
    }

    Bloggify.pages.find(query, options).toArray(function (err, pages) {
        if (err) { return callback(err); }
        pages.push(Bloggify.config.blog);
        pages.sort(function (a, b) {
            return a.order > b.order;
        });
        callback(null, pages);
    });
};

Cache.post = function (m_query, m_options, options, callback) {

    if (typeof m_query === "function") {
        callback = m_query;
        m_query = {};
        m_options = {};
        options = { markdown: true };
    } else if (typeof m_options === "function") {
        callback = m_options;
        m_query = {};
        m_options = {};
        options = { markdown: true };
    } else if (typeof options === "function") {
        callback = options;
        options = m_options;
        m_options = {};
    }

    function preparePosts(posts, callback) {
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
                    return callback(null, posts);
                }
            }

            Cache.file(Bloggify.config.posts  + "/" + cPost.id + ".md"
                , { markdown: options.markdown }
                , function (err, content) {
                if (err) { return clb(err); }
                cPost.content = content;
                if (++complete === length) {
                    return callback(null, posts);
                }
            });
        }

        for (var i = 0; i < length; ++i) {
            var cPost = posts[i];
            cPost.date = Moment(cPost.date, "DD-MM-YYYY HH:mm");
            cPost.url = Bloggify.config.blog.path + "/" + cPost.id + "-" + cPost.slug;
            readFile(cPost);
        }
    }

    Bloggify.posts.find(m_query, m_options).toArray(function (err, posts) {
        if (err) { return callback(err); }
        preparePosts(posts, function (err) {
            if (err) { return callback(err); }
            callback(null, posts);
        });
    });
};
