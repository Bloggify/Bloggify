// dependencies
var JxUtils = require ("jxutils");

// site config
global.SITE_CONFIG = {
    title: "Ionică Bizău"
  , url: "http://ionicabizau.net"
  , blog: {
        url: "/blog"
      , posts: {
            limit: 7
        }
    }
  , cache: {
        initOnStart: true
      , ttl: 100000
    }
  , session: {
        ttl: 10000
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

/**
 *  This is a recursive function that parses the paths saving them in
 *  "parsed" field. Then they can be accessed.
 *
 */
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
                //console.warn (e.toString());
            }
        }
    }
}

// start parsing paths
parsePaths (SITE_CONFIG.paths, ["parsed"]);

// set global variable
global.SITE_CONFIG = JxUtils.unflattenObject (SITE_CONFIG);

// exports the site config
module.exports = SITE_CONFIG;
