// dependencies
var Statique = global.Statique = require ("statique")
  , Config = global.Config = require ("./config.js")
  , Url = require("url")
  , Http = require ("http")
  , Apis = require ("./apis")
  , ipaddress = process.env.OPENSHIFT_NODEJS_IP || "localhost"
  , port      = process.env.OPENSHIFT_NODEJS_PORT || 8080
  ;

Config.gitSite.parsed.roots.pages["/login"] = {
    url: "/core/html/login.html"
  , visible: false
};

Config.gitSite.parsed.roots.pages["/blog"] = {
    url: "/core/html/blog.html"
  , label: "Blog"
  , order: 19
};

// statique config
Statique
    .server({root: Config.gitSite.paths.ROOT})
    .setRoutes(Config.gitSite.parsed.roots.pages)
  ;

// create server
Http.createServer (function(req, res) {

    // get the url
    var pathName = Url.parse(req.url, true).pathname;

    // add "/" at the end of the path name
    if (pathName.slice(-1) !== "/") {
        pathName += "/";
    }

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

process.on("uncaughtException", function (err) {
    console.log (err);
});
