// dependencies
var Statique = global.Statique = require ("statique")
  , Config = global.Config = require ("./config.js")
  , Url = require("url")
  , Http = require ("http")
  , Apis = require ("./apis")
  , port = process.env.PORT || 8080
  ;

// statique config
Statique
    .server({root: Config.gitSite.paths.ROOT})
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

    var route = Statique.getRoute (pathName);
    if (route) {
        Apis.handlePage (req, res, pathName, route);
        return;
    }

    // maybe the route is an api url
    var api = Apis[pathName];
    if (typeof api === "function") {
        return api (req, res);
    }

    // serve files
    Statique.serve (req, res);
}).listen(port);

// print some output
console.log("Statique server running at http://localhost:%d", port);
