/**
 * The util functions
 */
var Utils = module.exports = require("jxutils")
  , Fs = require("fs")
  , ReadJson = require("r-json")
  , Ul = require("ul")
  ;

/**
 * clone
 * Clones an item
 *
 * @name clone
 * @function
 * @param {Anything} item The item that should be cloned
 * @return {Object} The cloned object
 */
Utils.clone = Ul.clone;
Utils.readJson =  function (path, cb) {

    if (!/\.json$/.test(path)) {
        path += ".json";
    }

    function checkErr(err) {
        if (e.code === "ENOENT") {
            return null;
        }
        return e;
    }

    if (typeof cb === "function") {
        try {
            return ReadJson(path);
        } catch (e) {
            if (checkErr(e)) { throw e; }
        }
    }

    ReadJson(path, function (err, data) {
        cb(checkErr(err), data);
    });
};

/**
 * slug
 * Converts a string to slug
 *
 * @name slug
 * @function
 * @param {String} input The input string that should be converted to slug
 * @return {String} The slug that was generated
 */
Utils.slug = function (input) {
    return input.replace(/[^A-Za-z0-9-]+/g, '-').toLowerCase();
}

Utils.mergeRecursive = Ul.deepMerge;
