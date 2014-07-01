// Constructor
var BloggifyLib = module.exports = {};

// Internal cache
var _cache = {};

BloggifyLib.emitter = new EventEmitter();

BloggifyLib.initApi = function () {

    // Init database
    BloggifyLib.database = new JsonDB();

    // Add apis
    BloggifyLib.post = require(__dirname + "/api/post");
    BloggifyLib.file = require(__dirname + "/api/file");
    BloggifyLib.form = require(__dirname + "/api/form");

    // Init posts collection
    BloggifyLib.post._col = BloggifyLib.database.initCollection({
        inputFile: Config.site.paths.roots.posts
      , outputFile: Config.site.paths.roots.posts
      , uri: Config.database.uri
      , collection: "posts"
      , autoInit: true
    }, function (err) {
        if (err) { return Debug.log(err, "error"); }
        Debug.log("Inited posts collection.", "info");
    });
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
    BloggifyLib.initApi();

    // Set log level
    Debug._config.logLevel = Config.logLevel;

    // start parsing paths
    Utils.parsePaths(Config.site.paths, ["parsed"]);
    BloggifyLib.post.reorder();

    // Cache
    Statique._fileCache = {
        _removePath: function (path) {
            Debug.log("Removing file from cache: " + path, "info");
            delete Statique._fileCache[path]
        }
      , dummyPath: {
            ttl: setTimeout (function () {
                delete Statique._fileCache["dummyPath"];
            }, Config.site.cache.ttl)
          , content: "Dummy"
        }
    };

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

    Config.site.parsed.roots.pages["/admin/posts/edit"] = {
        get: function (req, res) {

            var parsedUrl = Url.parse(req.url)
              , urlSearch = QueryString.parse(parsedUrl.search && parsedUrl.search.substring(1))
              , postId = parseInt(urlSearch.postId)
              ;

            if (postId <= 0 || isNaN(postId)) {
                return Statique.redirect(res, "/admin/posts/new");
            }

            // Get template
            BloggifyLib.file.read("/template/core/html/admin/edit-post.html", function (err, fileContent) {

                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(req, res, 500);
                }

                // Get post info
                var cPost = BloggifyLib.post.fetch(req, {id: postId}, null, null, true);
                if (!cPost) {
                    return Statique.error(req, res, 404);
                }

                // Get post content
                BloggifyLib.file.read(Config.site.paths.roots.posts + "/" + cPost.path, function (err, postContent) {
                    if (err) {
                        Debug.log(err, "error");
                        return Statique.error(req, res, 500);
                    }
                    cPost.content = postContent;
                    Statique.sendRes(res, 200, "text/html",
                        Utils.mRender(fileContent, {
                            data: {
                                post: cPost
                            }
                          , config: Config
                        })
                    );
                });
            });
        }
      , loggedIn: true
      , slug: "edit-post"
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

    // Init plugins
    for (var plugin in Config.plugins) {
        (function (cPlugin, plugin) {
            Debug.log("Downloading " + plugin + " plugin.", "info");
            var pathToPlugin = (options.root || _cache._root) + "/plugins/" + plugin;
            if (Fs.existsSync(pathToPlugin)) {
                Utils.requireNoCache(pathToPlugin);
                Debug.log("Plugin already exists: " + plugin, "warn");
                return;
            }
            Git.clone({
                repo: cPlugin.source || cPlugin
              , dir: pathToPlugin
              , depth: 1
            }, function (err, data) {
                if (err) { return Debug.log(err, "error"); }
                Debug.log("Successfully downloaded " + plugin + " plugin.", "info");
                Utils.requireNoCache(pathToPlugin);
            });
        })(Config.plugins[plugin], plugin)
    }

    // Output
    Debug.log("Started Bloggify platform", "info");
};
