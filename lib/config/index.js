var Utils = require("./utils")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Fs = require("fs")
  , JsonDB = require("mongo-sync-files")
  , Debug = require("bug-killer")
  , Plugin = require("./lib/api/plugin")
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
  , options: {
        social: "Who am I?"
      , customCSS: []
      , customJS: []
    }
  , blog: {
        path: "/blog"
      , slug: "blog"
      , title: "Blog"
      , order: 11
      , articles: {
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
  , articles: "/articles"
  , plugins: []
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

        bConfig = Bloggify.config = Utils.mergeRecursive(
            DEFAULT_CONFIG
          , Utils.readJson("./config.json")
        );

        bConfig.pathContent = Bloggify.ROOT + bConfig.content;
    }
    return bConfig;
};

Bloggify.initPlugins = Plugin.initPlugins;

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
        Bloggify.log("Inited posts collection.", "info");
        clb(null);
    });

    // Init posts collection
    var pathPosts = Bloggify.config.pathContent + Bloggify.config.posts + "/index.json";
    ++complete;
    Bloggify.posts = Bloggify.db.initCollection({
        inputFile: pathPosts
      , outputFile: pathPosts
      , uri: Bloggify.config.database.uri
      , collection: "posts"
      , autoInit: true
    }, function (err) {
        if (err) { return clb(err); }
        Bloggify.log("Inited posts collection.", "info");
        clb(null);
    });
};
