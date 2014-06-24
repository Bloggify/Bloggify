/**
 * The util functions
 */
var Utils = module.exports = require("jxutils");

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
            parents = JSON.parse(JSON.stringify(parents));
            parents.push(path);
            Utils.parsePaths(cPath, parents);
        } else {
            try {
                var modulePath = __dirname + Config.site.path + cPath;
                Config.site[
                    parents.join(".") + "." + path
                ] = Utils.requireNoCache(modulePath);
            } catch (e) {
                if (Debug._config.logLevel >= 4) {
                    throw e;
                }
                Debug.log(e, "error");
            }
        }
    }

    Config.site = Utils.unflattenObject(Config.site);
};

/**
 * readFileSync
 * Returns the file content
 *
 * @name readFileSync
 * @function
 * @param {String} path The path to the file that should be read
 * @return {String} The content of the file
 */
Utils.readFileSync = function (path) {
    return Fs.readFileSync(path).toString();
};

/**
 * mRender
 * Renders a string using Mustache
 *
 * @name mRender
 * @function
 * @param {String} str The input string contaning curlies
 * @param {Object} data The data object
 * @param {Object|undefined} options An object containing the options
 * @return {String} The rendered string
 */
Utils.mRender = function (str, data, options) {
    options = Object(options);
    options.repeat = options.repeat || 1;
    for (var i = 0; i < options.repeat; ++i) {
        str = Mustache.render(str, data, options.renderOptions);
    }
    return str;
};
