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
            fileCache[relPath].buffer = fileCache[relPath] || [];
            fileCache[relPath].push(callback);
            return;
        } else {
            clearTimeout(fileCache[relPath].expire);
            fileCache[relPath].expire = function () {
                setTimeout(function () {
                    delete fileCache[relPath];
                }, Bloggify._config.cache.ttl);
            };
            return callback(null, fileCache[relPath].content);
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
        if (options.markdown === true) {
            fileCache[relPath].content = Marked.parse(data);
        } else {
            fileCache[relPath].content = data;
        }

        fileCache[relPath].expire = function () {
            setTimeout(function () {
                delete fileCache[relPath];
            }, Bloggify._config.cache.ttl);
        };

        callbacks(null, fileCache[relPath].content);
    });
};

Cache.page = function (query, callback) {

    if (typeof query === "function") {
        callback = query;
        query = {};
    }

    Bloggify.pages.find(query).toArray(function (err, pages) {
        if (err) { return callback(err); }
        pages.push(Bloggify._config.blog);
        pages.sort(function (a, b) {
            return a.order > b.order;
        });
        callback(null, pages);
    });
};

Cache.post = function (query, options, callback) {

    if (typeof query === "function") {
        callback = query;
        options = {};
        query = {};
    } else if (typeof options === "function") {
        callback = options;
        options = {};
    }


    Bloggify.posts.find(query, options).toArray(callback);
};
