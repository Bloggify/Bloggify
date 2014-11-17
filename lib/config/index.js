// Dependencies
var B = require("./bloggify")
  , Utils = require(Bloggify.PATH_UTIL)
  , Fs = require("fs")
  , Plugin = require(Bloggify.PATH_LIB + "/api/plugin")
  , Debug = require("bug-killer")
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
      , Utils.readJson(Bloggify.ROOT + "/conf/index.json")
    );
    Bloggify.config.pathContent = Bloggify.ROOT + Bloggify.config.content;

    // Attach log method
    Debug.config.logLevel = Bloggify.config.logLevel;
    Bloggify.log = Debug.log;

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
        Bloggify.log("Inited pages collection.", "info");
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

/**
 * render
 * Renders the pages using the lien and data objects.
 *
 * @name render
 * @function
 * @param {Object} lien The lien object.
 * @param {Object} data Render data.
 * @return {undefined}
 */
Bloggify.render = function (lien, data) {

    data.config = Bloggify.config;
    data.lien = lien;
    data.config = Bloggify.config;
    data.require = require;

    var content = Bloggify.theme.render(data);
    var processor = Bloggify.processors[data.type];

    function processContent(arr) {
        var complete = 0;
        function checkComplete() {
            if (++complete === arr.length) {
                lien.end(content);
            }
        }
        for (var i = 0; i < arr.length; ++i) {
            var cFun = arr[i];
            if (typeof cFun !== "function") {
                checkComplete();
                continue;
            }
            if (cFun.length <= 3) {
                content = cFun(lien, data, content);
                checkComplete();
            } else {
                cFun(lien, data, content, function (nc) {
                    content = nc;
                    checkComplete();
                });
            }
        }
    }

    if (data.type === "sitePage" && processor[lien.pathName] && processor[lien.pathName].length) {
        processContent(processor[lien.pathName]);
    } else if (processor && processor.length) {
        processContent(processor);
    } else {
        lien.end(content);
    }
};
