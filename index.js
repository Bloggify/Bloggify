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

    // get route
    var route = Statique.getRoute (pathName);
    if (route) {
        Apis["handlePage:" + req.method](req, res, pathName, route);
        return;
    }

    // serve files
    Statique.serve (req, res);
}).listen(port);

// print some output
console.log("Server running at http://localhost:%d", port);
