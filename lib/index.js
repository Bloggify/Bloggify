"use strict";

const readFile = require("read-file-cache")
    , noop = require("noop6")
    , ajs = require("ajs")
    , typpy = require("typpy")
    ;

let disableCache = false;

/**
 * init
 *
 * @name init
 * @function
 * @param {Object} config The configuration object:
 *
 *  - `disableCache` (Boolean): If `true`, the cache will be disabled.
 *
 * @param {Bloggify} bloggify The `Bloggify` instance.
 */
exports.init = function (config, bloggify) {
    disableCache = config.disableCache;
    bloggify.options.theme.ext = "ajs";
    bloggify.viewer.render = exports.render;
};

/**
 * factory
 * Returns a HTTP request handler.
 *
 * @name factory
 * @function
 * @param {Function} cb The callback function.
 * @returns {Function} The request handler.
 */
exports.factory = cb => {
    return function (lien) {
        return cb((path, data, cb) => {
            return exports.render(lien, path, data, cb);
        }, lien);
    };
};

/**
 * render
 * Renders the file.
 *
 * @name render
 * @function
 * @param {Lien} lien The `Lien` instance.
 * @param {String} path The file path.
 * @param {Object} data The template data.
 * @param {Function} cb The callback function.
 */
exports.render = function (lien, path, data, cb) {
    cb = cb || noop;
    ajs.renderFile(path, {
        locals: data
      , cache: !disableCache
    }, function (err, html) {
        if (err) {
            lien.end("An error occured when rendering the page.", 500);
            return cb(err);
        }

        if (typpy(data, Error) && !data.STATUS_CODE) {
            data.STATUS_CODE = 400;
        }

        lien.end(html, data.STATUS_CODE || 200);
        cb(null, html);
    });
};
