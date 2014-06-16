// Dependencies
var G = global
  , Statique    = G.Statique    = require("statique")
  , Utils       = G.Utils       = require("./utils")
  , Fs          = G.Fs          = require("fs");
  , Url         = G.Url         = require("url")
  , Http        = G.Http        = require("http")
  , Config      = G.Config      = require("./config.js")
  , Apis        = G.Apis        = require("./apis")
  , Marked      = G.Marked      = require("marked")
  , Moment      = G.Moment      = require("moment")
  , Mustache    = G.Mustache    = require("mustache")
  , QueryString = G.QueryString = require("querystring")
  , Mandrill    = G.Mandrill    = require('mandrill-api/mandrill')
  , Validators  = G.Validators  = require("./apis/validators")
  , Highlight   = G.Highlight   = require("highlight.js")
  ;

// Dessions
global.sessions = {};

// Attach core pages
Config.gitSite.parsed.roots.pages["/login"] = {
    url: "/core/html/login.html"
  , visible: false
  , slug: "login"
};

Config.gitSite.parsed.roots.pages["/blog"] = {
    url: "/core/html/blog.html"
  , label: "Blog"
  , order: 19
  , slug: "blog"
};

Config.gitSite.parsed.roots.pages["/admin"] = {
    url: "/core/html/admin.html"
  , label: "Admin"
  , order: 21
  , loggedIn: true
  , slug: "admin"
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

    // normalize path name
    if (pathName.substr(-1) !== "/") {
        pathName += "/";
    }


    var route = Statique.getRoute(pathName)
      , isBlogPost = (
            new RegExp(SITE_CONFIG.blog.url + "\/[0-9]+.*")
        ).test(pathName)
      ;


    if (route && route.url || isBlogPost) {
        Apis["handlePage:" + req.method](req, res, pathName, route, null, isBlogPost);
        return;
    }

    // serve files
    Statique.serve(req, res);
}).listen(Config.port, Config.ipaddress);

// print some output
console.log("Server running at http://%s:%d", Config.ipaddress || "localhost", Config.port);
