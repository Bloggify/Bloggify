// Dependencies
var Statique = global.Statique = require("statique")
  , Utils = require("./utils")
  , JxUtils = require("jxutils")
  , Config = global.Config = require("./config.js")
  , Url = require("url")
  , Http = require("http")
  , Apis = require("./apis")
  , ipaddress = Config.ipaddress
  , port = Config.port
  ;

// Dessions
global.sessions = {};

// Attach core pages
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

// Handle uncaught exceptions
process.on("uncaughtException", function (err) {
    console.error(err);
});

// statique config
Statique
    .server({ root: Config.gitSite.paths.ROOT })
    .setRoutes(Config.gitSite.parsed.roots.pages)
  ;

// create server
Http.createServer(function(req, res) {

    var pathName = Url.parse(req.url, true).pathname;


    var route = Statique.getRoute(pathName).url
      , isBlogPost = (
            new RegExp(SITE_CONFIG.blog.url + "\/[0-9]+.*")
        ).test(pathName)
      ;


    if (route || isBlogPost) {
        Apis["handlePage:" + req.method](req, res, pathName, route, null, isBlogPost);
        return;
    }

    // serve files
    Statique.serve(req, res);
}).listen(port, ipaddress);

// print some output
console.log("Server running at http://%s:%d", ipaddress || "localhost", port);
