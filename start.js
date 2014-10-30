var Utils = require("./utils")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Fs = require("fs")
  ;

global.Bloggify = new EventEmitter();
Bloggify.ROOT = __dirname;

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
