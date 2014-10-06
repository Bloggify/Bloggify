// Dependencies
var Debug = Bloggify.debug
  , Config = Bloggify._config
  ;

/**
 * The util functions
 */
var Utils = module.exports = require("jxutils");

/**
 * clone
 * Clones an item
 *
 * @name clone
 * @function
 * @param {Anything} item The item that should be cloned
 * @return {Object} The cloned object
 */
Utils.clone = function clone (item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ]
      , result
      ;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) {
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }

    return result;
};

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
    try {
        path = require.resolve(path);
    } catch (e) {}
    delete require.cache[path];
    var content = {};
    try {
        content = require(path);
    } catch (e) {
        if (/unexpected/i.test(e.message)) {
            Debug.log(e.message, "error");
        }
    }
    return content;
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

/**
 * parseCookies
 * This function parses the cookies from request
 *
 * @name parseCookies
 * @function
 * @param {Object} request the request object
 * @return {Object} the parsed cookies into an object
 */
Utils.parseCookies = function (request) {
    var list = {}
      , rc = request.headers.cookie
      ;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return list;
}
