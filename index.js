// dependencies
var Statique = require ("statique")
  , Url = require("url")
  , Http = require ("http")
  , Apis = require ("./apis")
  , Config = require ("./config.js")
  , Marked = require("marked")
  , port = process.env.PORT || 8080
  ;

// statique config
Statique
    .server({root: Config.gitSite.path})
    .setRoutes(Config.gitSite.parsed.roots.pages)
  ;

// create server
Http.createServer (function(req, res) {

    // get the url
    var pathName = Url.parse(req.url, true).pathname;

    // verify if it doesn"t end with "/"
    if (pathName.slice(-1) !== "/") {
        // if yes, add "/"
        pathName += "/";
    }

    // maybe the route is an api url
    var api = Apis[pathName];
    if (typeof api === "function") {
        return api (req, res);
    }

    // serve files
    Statique.sendRes (req, res);
}).listen(port);

// print some output
console.log("Statique server running at http://localhost:%d", port);
