/**
 * The util functions
 */
var Utils = require("jxutils");

/**
 * requireNoCache
 * Requires a module, deleting the cache
 *
 * @name requireNoCache
 * @function
 * @param {String} path The Node.JS module name that should be included.
 * @return {Object} Parsed and evaluated module
 */
Utils.requireNoCache = function (path) {
    delete require.cache[require.resolve(path)];
    return require(path);
};

/**
 * parsePaths
 * This is a recursive function that parses the paths saving them in
 * "parsed" field. Then they can be accessed.
 *
 * @name parsePaths
 * @function
 * @param {Object} objToIterate The object with paths that should be parsed
 * @param {Array} parents Array of strings with already parsed fields
 * @return
 */
Utils.parsePaths = function (objToIterate, parents) {

    for (var path in objToIterate) {
        var cPath = objToIterate[path];

        if (cPath.constructor.name === "Object") {
            parents = JSON.parse (JSON.stringify (parents));
            parents.push (path);
            parsePaths (cPath, parents);
        } else {
            try {
                var modulePath = SITE_CONFIG.paths.ROOT + cPath;
                SITE_CONFIG[parents.join(".") + "." + path] = requireNoCache (modulePath);
            } catch (e) {
                console.warn (e.toString());
            }
        }
    }

    SITE_CONFIG = JxUtils.unflattenObject (SITE_CONFIG);
};
