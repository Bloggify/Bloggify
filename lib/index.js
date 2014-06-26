var BloggifyLib = module.exports = {};

var _cache = {};

BloggifyLib.post = {
    publish: function (post, callback) {
        var content = post.content
        delete post.content;
        Config.site.parsed.roots.posts.push(post);
        BloggifyLib.post.refresh();
        Fs.writeFile(
            _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/posts.json"
          , JSON.stringify(Config.site.parsed.roots.posts, null, 2)
          , function (err, data) {
                if (err) { return callback(err); }
                Fs.writeFile(
                    _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/" + post.path
                  , content
                  , callback
                )
        });
    }
  , refresh: function () {
        Config.site.parsed.roots.posts.sort(function (a, b) {
            if (Moment(a.publishedAt, "DD-MM-YYYY HH:mm") < Moment(b.publishedAt, "DD-MM-YYYY HH:mm")) {
                return 1;
            }
            return -1;
        });
    }
};

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
    BloggifyLib.post.refresh();
    debugger;

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

    // Admin pages
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

    Config.site.parsed.roots.pages["/admin/posts/new"] = {
        url: "/template/core/html/admin/new-post.html"
      , loggedIn: true
      , slug: "new-post"
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
