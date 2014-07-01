var BloggifyLib = module.exports = {};

var _cache = {};

BloggifyLib.post = {};

// Publish post
BloggifyLib.post.publish = function (post, callback) {
    var content = post.content
    delete post.content;
    Config.site.parsed.roots.posts.push(post);
    BloggifyLib.post.reorder();
    Fs.writeFile(
        _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/posts.json"
      , JSON.stringify(Config.site.parsed.roots.posts, null, 2)
      , function (err, data) {
            if (err) { return callback(err); }
            Fs.writeFile(
                _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/" + post.id + ".md"
              , content
              , callback
            )
    });
};

// Edit post
BloggifyLib.post.edit = function (query, editedPost, callback) {
    var cPost = BloggifyLib.post.fetch(req, query, null, null, true);
    if (!cPost) { return Statique.error(req, res, 404); }
    for (var key in editedPost) {
        cPost[key] = editedPost[key] || cPost[key];
    }
    delete cPost.content;
    BloggifyLib.clearCache();
    Fs.writeFile(
        _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/posts.json"
      , JSON.stringify(Config.site.parsed.roots.posts, null, 2)
      , function (err, data) {
            if (err) { return callback(err); }
            Fs.writeFile(
                _cache.APP_ROOT + Config.site.path + Config.site.paths.roots.posts + "/" + post.id + ".md"
              , content
              , callback
            )
    });
};

// Fetch posts
    // TODO By query
BloggifyLib.post.fetch = function (req, query, fileContent, callback, noAttachContent) {

    callback = callback || function () {};
    var posts = Utils.clone(Config.site.parsed.roots.posts)
      , postId = req && typeof req.url === "string" && req.url.match(/[0-9]+/)[0]
      ;

    if (query && query.id) {
        postId = query.id;
    }

    if (!postId) { return null; }

    for (var i = 0, cPost; i < posts.length; ++i) {
        cPost = posts[i];
        if (postId.toString() === cPost.id.toString()) {
            return BloggifyLib.post.handle(req, cPost, fileContent, callback, noAttachContent);
        }
    }

    return null;
};

// Handle post
BloggifyLib.post.handle = function (req, cPost, postContent, callback, noAttachContent) {
    callback = callback || function () {};
    if (typeof postContent === "string") {
        cPost.content = Marked(postContent);
    }
    if (!cPost.content && !postContent && noAttachContent !== true) {
        return BloggifyLib.file.read(Config.site.paths.roots.posts + "/" + cPost.path, function (err, postContent) {
            if (err) { return callback(err); }
            BloggifyLib.post.handle(req, cPost, postContent, callback);
        });
    }
    cPost.date = Moment(cPost.publishedAt, "DD-MM-YYYY HH:mm").format("dddd, MMMM D YYYY");
    cPost.url = Config.site.blog.url + "/" + cPost.id + "-" + cPost.slug;
    cPost.fullUrl = "http://" + req.headers.host + cPost.url;
    callback(null, cPost);
    return cPost;
};

// Reorder posts
BloggifyLib.post.reorder = function () {
    Config.site.parsed.roots.posts.sort(function (a, b) {
        if (Moment(a.publishedAt, "DD-MM-YYYY HH:mm") < Moment(b.publishedAt, "DD-MM-YYYY HH:mm")) {
            return 1;
        }
        return -1;
    });
};

BloggifyLib.file = {};

/**
 * readFile
 * This function reads a file from hard disk or from cache
 * deleting it after the ttl timeout expires.
 *
 * @name readFile
 * @function
 * @param {String} path path that will be passed to Statique
 * @param {Function} callback the callback function
 * @return
 */
BloggifyLib.file.read = function (path, callback) {

    // Try to get the file from cache
    var fromCache = Statique._fileCache[path];
    if (fromCache) {

        // reset timeout
        fromCache.ttl = setTimeout(
            Statique._fileCache._removePath
          , Config.site.cache.ttl
        );

        // callback content
        return callback(null, fromCache.content);
    }

    // Read file using statique
    Statique.readFile(path, function (err, content) {
        if (err) { return callback(err); }

        Statique._fileCache[path] = {
            ttl: setTimeout(function () {
                delete Statique._fileCache[path];
            }, Config.site.cache.ttl)
          , content: content
        };

        callback(null, content.toString());
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

    BloggifyLib. = MyDatabase.initCollection({
        inputFile: __dirname + "/docs-in.json"
      , outputFile: __dirname + "/docs-out.json"
      , uri: "mongodb://localhost:27017/test"
      , collection: "myCol"
      , autoInit: true
    }, function (err) {

    // Handle uncaught exceptions
    if (Config.logLevel < 4) {
        process.on("uncaughtException", function (err) {
            Debug.log(err, "error");
        });
    }

    // Output
    Debug.log("Started Bloggify platform", "info");
};
