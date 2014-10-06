// Constructor
var BloggifyLib = module.exports = {};

// Init Bloggify emitter used to comunicate with plugins
BloggifyLib.emitter = new Bloggify._deps.events.EventEmitter();

/**
 * initApi
 * Init Bloggify API
 *
 * @name initApi
 * @function
 * @return
 */
BloggifyLib.initApi = function () {

    // Add apis
    BloggifyLib.post = require(__dirname + "/api/post");
    BloggifyLib.file = require(__dirname + "/api/file");
    BloggifyLib.form = require(__dirname + "/api/form");
    BloggifyLib.session = require(__dirname + "/api/session");
    BloggifyLib.plugin = require(__dirname + "/api/plugin");
};

/**
 * initDb
 *
 * @name initDb
 * @function
 * @return
 */
BloggifyLib.initDb = function () {

    // Init database
    BloggifyLib.database = new JsonDB();

    var siteRoot = Config.root + Config.site.path
      , jsonPosts = siteRoot + Config.site.paths.roots.posts + "/posts.json"
      , sessionsFilePath = Config.root + "/tmp/sessions.json"
      ;

    // Init posts collection
    BloggifyLib.post._col = BloggifyLib.database.initCollection({
        inputFile: jsonPosts
      , outputFile: jsonPosts
      , uri: Config.database.uri
      , collection: "posts"
      , autoInit: true
    }, function (err) {
        if (err) { return Debug.log(err, "error"); }
        Debug.log("Inited posts collection.", "info");
    });

    // Init sessions collection
    BloggifyLib.session._col = BloggifyLib.database.initCollection({
        inputFile: sessionsFilePath
      , outputFile: sessionsFilePath
      , uri: Config.database.uri
      , collection: "sessions"
      , autoInit: true
    }, function (err) {
        if (err) { return Debug.log(err, "error"); }
        Debug.log("Inited sessions collection.", "info");
    });
};


/**
 * clearCache
 * Clear Bloggify cache
 *
 * @name clearCache
 * @function
 * @return
 */
BloggifyLib.clearCache = function () {

    // Require config
    var conf = Utils.requireNoCache(Config.root + "/config");
    for (var key in conf) {
        Config[key] = conf[key];
    }

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

    for (var url in Config.site.corePages) {
        Config.site.parsed.roots.pages[url] = Config.site.corePages[url];
    }


    // Blog page
    if (Config.site.blog) {
        Config.site.parsed.roots.pages[Config.site.blog.url] = {
            url: Config.site.paths.theme + "/core/html/blog.html"
          , label: Config.site.blog.label
          , order: Config.site.blog.order
        };
    }


    Config.site.parsed.roots.pages["/admin/posts/edit"] = {
        get: function (req, res) {

            var parsedUrl = Url.parse(req.url)
              , urlSearch = QueryString.parse(parsedUrl.search && parsedUrl.search.substring(1))
              , postId = parseInt(urlSearch.postId)
              ;

            if (postId <= 0 || isNaN(postId)) {
                return Statique.redirect(res, "/admin/posts/new");
            }

            // Get theme
            BloggifyLib.file.read(Config.site.paths.theme + "/core/html/admin/edit-post.html", function (err, fileContent) {

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
                BloggifyLib.file.read(Config.site.paths.roots.posts + "/" + cPost.id + ".md", function (err, postContent) {
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
      , post: function (req, res, form) {
            form.on("done", function (form) {
                var formData = QueryString.parse(form.data);
                Bloggify.session.isLoggedIn(req, function (err, sessionData) {

                    if (err) {
                        Debug.log(err, "error");
                        return Statique.error(500);
                    }

                    if (!sessionData) {
                        return Statique.sendRes(res, 403, "text", JSON.stringify({
                            message: "Sign in to post something here."
                        }));
                    }

                    var postId = parseInt(formData.postId)
                      , editedPost = {
                            title: formData.title
                          , slug: Utils.slug(formData.title)
                          , content: formData.content
                        }
                      ;

                    Bloggify.post.edit(req, {id: postId}, editedPost, function (err, data) {
                        if (err) {
                            return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                                message: err
                            }));
                        }
                        Statique.sendRes(res, 200, "text/html", JSON.stringify({
                            message: "Post updated."
                        }));
                    });
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
        .server({ root: Config.root + Config.site.path })
        .setRoutes(Config.site.parsed.roots.pages)
        .setErrors(Config.errorPages)
      ;
};


/**
 * start
 * Start Bloggify platform
 *
 * @name start
 * @function
 * @param {Object} options The options object containing the following fields:
 *  - root: the bloggify root directory
 * @return
 */
Bloggify.start = function () {

    BloggifyLib.initApi();

    // Clear cache
    BloggifyLib.clearCache();
    BloggifyLib.initDb();

    // Handle uncaught exceptions
    if (Config.logLevel < 4) {
        process.on("uncaughtException", function (err) {
            Debug.log(err.stack, "error");
        });
    }

    // Init plugins
    BloggifyLib.plugin.installAll(function (err, data) {
        if (err) {
            return Debug.log("An error ocured when initing plugins: " + err, "error");
        }

        // Output
        Debug.log("Started Bloggify platform", "info");
    });
};
