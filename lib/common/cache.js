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
        };

        if (err) {
            delete fileCache[relPath];
            return callbacks(err);
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

        callbacks(null, data);
    });
};
