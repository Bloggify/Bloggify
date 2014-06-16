// Dependencies
var G = global
  , Statique    = G.Statique    = require("statique")
  , Utils       = G.Utils       = require("./utils")
  , Fs          = G.Fs          = require("fs");
  , Url         = G.Url         = require("url")
  , Http        = G.Http        = require("http")
  , Apis        = G.Apis        = require("./apis")
  , Marked      = G.Marked      = require("marked")
  , Moment      = G.Moment      = require("moment")
  , Mustache    = G.Mustache    = require("mustache")
  , QueryString = G.QueryString = require("querystring")
  , Mandrill    = G.Mandrill    = require('mandrill-api/mandrill')
  , Validators  = G.Validators  = require("./apis/validators")
  , Highlight   = G.Highlight   = require("highlight.js")
  , Bloggify    = G.Bloggify    = require("./lib")
  ;

// Dessions
global.sessions = {};

// Start core
Bloggify.start();

// Handle uncaught exceptions
process.on("uncaughtException", function (err) {
    console.error(err);
});

// Create server
Http.createServer(function(req, res) {

    var pathName = Url.parse(req.url, true).pathname;

    // Normalize path name
    if (pathName.substr(-1) !== "/") {
        pathName += "/";
    }

    var route = Statique.getRoute(pathName)
      , isBlogPost = (
            new RegExp(Config.gitSite.blog.url + "\/[0-9]+.*")
        ).test(pathName)
      ;


    if (route && route.url || isBlogPost) {
        Apis["handlePage:" + req.method](req, res, pathName, route, null, isBlogPost);
        return;
    }

    // Serve files
    Statique.serve(req, res);
}).listen(Config.port, Config.ipaddress);

// Print some output
console.log("Server running at http://%s:%d", Config.ipaddress || "localhost", Config.port);
