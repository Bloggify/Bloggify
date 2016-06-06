"use strict";

const readFile = require("read-file-cache")
    , noop = require("noop6")
    , ejs = require("ejs")
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
    getFile(path, disableCache, (err, fileContent) => {
        if (err) {
            lien.end("An error occured when rendering the page.", 500);
            return cb(err);
        }
        let html = ejs.render(fileContent, data);
        lien.end(html);
        cb(null, html);
    });
};
