var JxUtils = require ("jxutils");

global.SITE_CONFIG = {
    title: "Ionică Bizău"
  , url: "http://ionicabizau.net"
  , cache: {
        initOnStart: true
      , ttl: 60 * 1000 * 60 * 24
    }
  , paths: {
        roots: {
            pages: "/pages"
          , posts: "/posts"
          , users: "/users"
        }
      , template: "/template"
      , ROOT: __dirname
    }
};

function parsePaths (objToIterate, parents) {

    for (var path in objToIterate) {
        var cPath = objToIterate[path];

        if (cPath.constructor.name === "Object") {
            parents = JSON.parse (JSON.stringify (parents));
            parents.push (path);
            parsePaths (cPath, parents);
        } else {
            try {
                SITE_CONFIG[parents.join(".") + "." + path] = require (SITE_CONFIG.paths.ROOT + cPath);
            } catch (e) {
                console.warn (e.toString());
            }
        }
    }
}

parsePaths (SITE_CONFIG.paths, ["parsed"]);
SITE_CONFIG = JxUtils.unflattenObject (SITE_CONFIG);

module.exports = SITE_CONFIG;
