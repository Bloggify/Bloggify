var BloggifyLib = module.exports = {};

BloggifyLib.clearCache = function (options) {

    // Require config
    var Config = global.Config = Utils.requireNoCache(options.root + "/config");

    // Set log level
    Debug._config.logLevel = Config.logLevel;

    // start parsing paths
    Utils.parsePaths(Config.gitSite.paths, ["parsed"]);

    // Attach core pages
    Config.gitSite.parsed.roots.pages["/login"] = {
        url: "/core/html/login.html"
      , visible: false
      , slug: "login"
    };

    Config.gitSite.parsed.roots.pages["/blog"] = {
        url: "/core/html/blog.html"
      , label: "Blog"
      , order: 19
      , slug: "blog"
    };

    Config.gitSite.parsed.roots.pages["/admin"] = {
        url: "/core/html/admin.html"
      , label: "Admin"
      , order: 21
      , loggedIn: true
      , slug: "admin"
    };

    // statique config
    Statique
        .server({ root: options.root + Config.gitSite.url })
        .setRoutes(Config.gitSite.parsed.roots.pages)
      ;
};

/**
 * start
 *
 * @name start
 * @function
 * @param {Object} options The options object containing the following fields:
 *  - root: the bloggify root directory
 * @return
 */
BloggifyLib.start = function (options) {

    // Clear cache
    BloggifyLib.clearCache(options);

    // Handle uncaught exceptions
    if (Config.logLevel < 4) {
        process.on("uncaughtException", function (err) {
            Debug.log(err, "error");
        });
    }

    // Output
    Debug.log("Started Bloggify platform", "error");
};
