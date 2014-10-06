var Utils = require("./utils");

const DEFAULT_CONFIG = {
    site: {
        title: "No Title"
      , description: "Another awesome Bloggify website"
      , git: ""
      , blog: {
            path: "/blog"
          , label: "Blog"
          , order: 19
          , posts: {
                limit: 3
            }
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
        login: "admin",
      , password: "admin",
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
  , ipaddress: "localhost"
};

var bConfig = null;
exports.getConfig = function (force) {
    if (force || !bConfig) {
        return bConfig = Utils.mergeRecursive(
            DEFAULT_CONFIG
          , Utils.requireNoCache("./config")
        );
    }
    return bConfig;
};
