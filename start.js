var Utils = require("./utils")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Fs = require("fs")
  , JsonDB = require("mongo-sync-files")
  , Debug = require("bug-killer")
  ;

global.Bloggify = new EventEmitter();
Bloggify.ROOT = __dirname;
Bloggify.db = new JsonDB();
Bloggify.log = Debug.log;

const DEFAULT_CONFIG = {
    site: {
        title: "No Title"
      , description: "Another awesome Bloggify website"
      , git: ""
    }
  , blog: {
        path: "/blog"
      , label: "Blog"
      , order: 11
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

        bConfig.pathContent = Bloggify.ROOT + bConfig.content;
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
            if (!--complete) {
                callback(null, null);
            }
        }
      ;

    // Init pages collection
    var pathPages = Bloggify._config.pathContent + Bloggify._config.pages + "/index.json";
    ++complete;
    Bloggify.pages = Bloggify.db.initCollection({
        inputFile: pathPages
      , outputFile: pathPages
      , uri: Bloggify._config.database.uri
      , collection: "pages"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited posts collection.", "info");
        clb(null);
    });

    // Init posts collection
    var pathPosts = Bloggify._config.pathContent + Bloggify._config.posts + "/index.json";
    ++complete;
    Bloggify.post = Bloggify.db.initCollection({
        inputFile: pathPosts
      , outputFile: pathPosts
      , uri: Bloggify._config.database.uri
      , collection: "posts"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited posts collection.", "info");
        clb(null);
    });

    // Init sessions collection
    var pathSessions = Bloggify.ROOT + "/tmp/sessions.json";
    ++complete;
    Bloggify.session = Bloggify.db.initCollection({
        inputFile: pathSessions
      , outputFile: pathSessions
      , uri: Bloggify._config.database.uri
      , collection: "sessions"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited sessions collection.", "info");
        clb(null);
    });
};
