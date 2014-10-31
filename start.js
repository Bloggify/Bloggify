var Utils = require("./utils")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Fs = require("fs")
  , JsonDB = require("mongo-sync-files")
  ;

global.Bloggify = new EventEmitter();
Bloggify.ROOT = __dirname;
BloggifyLib.db = new JsonDB();

const DEFAULT_CONFIG = {
    site: {
        title: "No Title"
      , description: "Another awesome Bloggify website"
      , git: ""
    }
  , blog: {
        path: "/blog"
      , label: "Blog"
      , order: 19
      , posts: {
            limit: 3
        }
    }
  , cache: {
      initOnStart: true,
      ttl: 86400000
    }
  , session: {
      ttl: 864000000
    }
  , user: {
        login: "admin"
      , password: "admin"
      , name: "Admin"
    }
  , content: "/content"
  , theme: "/theme"
  , pages: "/pages"
  , posts: "/posts"
  , plugins: {}
  , database: {
        uri: "mongodb://localhost:27017/bloggify"
    }
  , port: 8080
  , host: "localhost"
  , fileCache: 1000 * 60 * 60 * 60 * 24 * 7 * 4
};

var bConfig = null;
Bloggify.getConfig = function (force) {

    if (force || !bConfig) {

        bConfig = Bloggify._config = Utils.mergeRecursive(
            DEFAULT_CONFIG
          , Utils.requireNoCache("./config")
        );

        bConfig.content = Bloggify.ROOT + bConfig.content;
        // TODO
        // bConfig.theme = bConfig.content + bConfig.theme;
        // bConfig.pages = bConfig.content + bConfig.pages;
        // bConfig.posts = bConfig.content + bConfig.posts;
    }
    return bConfig;
};

Bloggify.initPlugins = function (callback) {
    // TODO
    callback();
};

Bloggify.initDbs = function (callback) {

    var complete = 0
      , clbed = false
      , clb = function (e, d) {
            if (clbed === true) { return; }
            if (e) {
                clbed = true;
                return callback(e);
            }
            if (e) { return Debug.log(e, "error"); }
            if (--callback) {
                callback(null, null);
            }
        }
      ;

    // Init pages collection
    var pathPages = Bloggify.ROOT + Bloggify._config.pages + "/index.json";
    ++complete;
    Bloggify.pages = BloggifyLib.database.initCollection({
        inputFile: pathPages
      , outputFile: pathPages
      , uri: Bloggify._config.database.uri
      , collection: "pages"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Debug.log("Inited posts collection.", "info");
        clb(null);
    });

    // Init posts collection
    var pathPosts = Bloggify.ROOT + Bloggify._config.posts + "/index.json";
    ++complete;
    BloggifyLib.post._col = BloggifyLib.database.initCollection({
        inputFile: pathPosts
      , outputFile: pathPosts
      , uri: Config.database.uri
      , collection: "posts"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Debug.log("Inited posts collection.", "info");
        clb(null);
    });

    // Init sessions collection
    var pathSessions = Bloggify.ROOT + "/tmp/sessions.json";
    ++complete;
    BloggifyLib.session._col = BloggifyLib.database.initCollection({
        inputFile: pathSessions
      , outputFile: pathSessions
      , uri: Config.database.uri
      , collection: "sessions"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Debug.log("Inited sessions collection.", "info");
        clb(null);
    });
};
