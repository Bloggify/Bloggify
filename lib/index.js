"use strict";

const noop = require("noop6");

exports.init = function (config, _bloggify) {
    bloggify = _bloggify;
    bloggify.viewer.registerRenderer("js", exports.render);
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
exports.render = (lien, tmpl, data, cb) => {
    cb = cb || noop;
    require(tmpl.path)(lien, data, (err, res) => {
        if (err) { return cb(err); }
        data.statusCode = data.statusCode || (data.error && data.error.statusCode || 200);
        lien.end(res, data.statusCode);
        cb(null, res);
    });
};
