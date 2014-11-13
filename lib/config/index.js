// Dependencies
var B = require("./bloggify")
  , Utils = require(Bloggify.PATH_UTIL)
  , Fs = require("fs")
  , Plugin = require(Bloggify.PATH_LIB + "/api/plugin")
  ;

// Constants
const DEFAULT_CONFIG = require("./default");

/**
 * getConfig
 * Returns the parsed configuration.
 *
 * @name getConfig
 * @function
 * @return {Object} The Bloggify config.
 */
Bloggify.getConfig = function () {
    Bloggify.config = Utils.mergeRecursive(
        DEFAULT_CONFIG
      , Utils.readJson(Bloggify.ROOT + "/conf/config.json")
    );
    Bloggify.config.pathContent = Bloggify.ROOT + Bloggify.config.content;
    return Bloggify.config;
};

Bloggify.initPlugins = Plugin.initPlugins;


/**
 * initDbs
 * Initializes the MongoDB databases.
 *
 * @name initDbs
 * @function
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Bloggify.initDbs = function (callback) {

    // Handle async responses
    var complete = 0
      , clbed = false
      , clb = function (e, d) {
            if (clbed === true) { return; }
            if (e) {
                clbed = true;
                return callback(e);
            }
            if (e) { return Debug.log(e, "error"); }
            if (!--complete) {
                callback(null, null);
            }
        }
      ;

    // Init pages collection
    var pathPages = Bloggify.config.pathContent + Bloggify.config.pages + "/index.json";
    ++complete;
    Bloggify.pages = Bloggify.db.initCollection({
        inputFile: pathPages
      , outputFile: pathPages
      , uri: Bloggify.config.database.uri
      , collection: "pages"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited articles collection.", "info");
        clb(null);
    });

    // Init articles collection
    var pathArticles = Bloggify.config.pathContent + Bloggify.config.articles + "/index.json";
    ++complete;
    Bloggify.articles = Bloggify.db.initCollection({
        inputFile: pathArticles
      , outputFile: pathArticles
      , uri: Bloggify.config.database.uri
      , collection: "articles"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited articles collection.", "info");
        clb(null);
    });
};
