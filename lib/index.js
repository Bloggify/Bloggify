"use strict";

const noop = require("noop6");

exports.init = (config, bloggify) => {
    bloggify.viewer.registerRenderer("js", exports.render);
};

/**
 * render
 * Renders the file.
 *
 * @name render
 * @function
 * @param {ctx} ctx The context.
 * @param {String} path The file path.
 * @param {Object} data The template data.
 * @param {Function} cb The callback function.
 */
exports.render = (ctx, tmpl, data, cb) => {
    cb = cb || noop;
    require(tmpl.path)(ctx, data, (err, res) => {
        if (err) { return cb(err); }
        data.statusCode = data.statusCode || (data.error && data.error.statusCode || 200);
        ctx.end(res, data.statusCode);
        cb(null, res);
    });
};
