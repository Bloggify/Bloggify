process.on("uncaughtException", function (err) {
    console.error (err);
});

// dependencies
var Statique = global.Statique = require ("statique")
  , Utils = require ("./utils")
  , Config = global.Config = require ("./config.js")
  , Url = require("url")
  , Http = require ("http")
  , Apis = require ("./apis")
  , ipaddress = process.env.OPENSHIFT_NODEJS_IP || "localhost"
  , port      = process.env.OPENSHIFT_NODEJS_PORT || 8080
  ;

// sessions
global.sessions = {};

// attach core pages
Config.gitSite.parsed.roots.pages["/login"] = {
    url: "/core/html/login.html"
  , visible: false
};

Config.gitSite.parsed.roots.pages["/blog"] = {
    url: "/core/html/blog.html"
  , label: "Blog"
  , order: 19
};

Config.gitSite.parsed.roots.pages["/admin"] = {
    url: "/core/html/admin.html"
  , label: "Admin"
  , order: 21
  , loggedIn: true
};

// statique config
Statique
    .server({root: Config.gitSite.paths.ROOT})
    .setRoutes(Config.gitSite.parsed.roots.pages)
  ;

// create server
Http.createServer (function(req, res) {

    var pathName = Url.parse(req.url, true).pathname;

    // get route
    var route = Statique.getRoute (pathName)
      , isBlogPost =  (new RegExp (SITE_CONFIG.blog.url + "\/([a-z]|[0-9])")).test (pathName)
      ;

    if (route || isBlogPost) {
        Apis["handlePage:" + req.method](req, res, pathName, route, null, isBlogPost);
        return;
    }

    // serve files
    Statique.serve (req, res);
}).listen(port, ipaddress);

// print some output
console.log("Server running at http://localhost:%d", port);
