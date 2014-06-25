var BloggifyLib = module.exports = {};

var _cache = {};

BloggifyLib.clearCache = function (options) {

    if (options && options.root) {
        _cache.APP_ROOT = options.root;
    } else {
        options = {
            root: _cache.APP_ROOT
        };
    }

    // Require config
    var Config = global.Config = Utils.requireNoCache(options.root + "/config");

    // Set log level
    Debug._config.logLevel = Config.logLevel;

    // start parsing paths
    Utils.parsePaths(Config.site.paths, ["parsed"]);

    // Attach core pages
    var allPages = Utils.cloneObject(Config.site.parsed.roots.pages)
      , pagesObj = Config.site.parsed.roots.pages = {}
      ;

    for (var i = 0, cPage; i < allPages.length; ++i) {
        cPage = allPages[i];
        pagesObj[cPage.path] = cPage;
    }

    Config.site.parsed.roots.pages["/login"] = {
        url: "/template/core/html/login.html"
      , visible: false
      , slug: "login"
    };

    Config.site.parsed.roots.pages["/blog"] = {
        url: "/template/core/html/blog.html"
      , label: "Blog"
      , order: 19
      , slug: "blog"
    };

    Config.site.parsed.roots.pages["/admin"] = {
        url: "/template/core/html/admin/index.html"
      , label: "Admin"
      , order: 21
      , loggedIn: true
      , slug: "admin"
    };

    Config.site.parsed.roots.pages["/admin/posts"] = {
        url: "/template/core/html/admin/posts.html"
      , loggedIn: true
      , slug: "admin-posts"
      , wrap: false
    };

    // Attach error pages
    for (var err in Config.errorPages) {
        Config.site.parsed.roots.pages["/" + err] = Config.errorPages[err];
    }

    // Statique config
    Statique
        .server({ root: options.root + Config.site.path })
        .setRoutes(Config.site.parsed.roots.pages)
        .setErrors(Config.errorPages)
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
    Debug.log("Started Bloggify platform", "info");
};
