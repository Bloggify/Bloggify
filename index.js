// Dependencies
var G = global
  , Statique     = G.Statique     = require("statique")
  , Utils        = G.Utils        = require("./utils")
  , Fs           = G.Fs           = require("fs")
  , Url          = G.Url          = require("url")
  , Http         = G.Http         = require("http")
  , Marked       = G.Marked       = require("marked")
  , Moment       = G.Moment       = require("moment")
  , Mustache     = G.Mustache     = require("mustache")
  , QueryString  = G.QueryString  = require("querystring")
  , Mandrill     = G.Mandrill     = require("mandrill-api/mandrill")
  , Debug        = G.Debug        = require("bug-killer")
  , Validators   = G.Validators   = require("./apis/validators")
  , Highlight    = G.Highlight    = require("highlight.js")
  , JsonDB       = G.JsonDB       = require("mongo-sync-files")
  , EventEmitter = G.EventEmitter = require("events").EventEmitter
  , Git          = G.Git          = require("git-tools")
  , Npm          = G.Npm          = require("npm")
  , Bloggify     = G.Bloggify     = require("./lib")
  ;

// Dessions
global.sessions = {};

// Start core
Bloggify.start({
    root: __dirname
});

// Require apis after Config was inited
Bloggify.apis = require("./apis")

// Create server
Http.createServer(function(req, res) {

    var pathName = Url.parse(req.url, true).pathname;

    // Normalize path name
    if (pathName.substr(-1) !== "/") {
        pathName += "/";
    }

    // Error pages
    if (/\/[4-9][0-9][0-9]\//.test(pathName)) {
        return Statique.serve(req, res);
    }

    var route = Statique.getRoute(pathName)
      , isBlogPost = (
            new RegExp(Config.site.blog.url + "\/[0-9]+.*")
        ).test(pathName)
      , isBlogPage = new RegExp(
            Config.site.blog.url + "(\/page\/[1-9]([0-9]*))?\/$"
        ).test(pathName)
      ;

    if (route && route.url && typeof route.url === "object") {
        return Statique.serve(req, res);
    }

    if (route && route.url || isBlogPost || isBlogPage) {
        if (typeof Bloggify.apis["handlePage:" + req.method] !== "function") {
            return Statique.serve(req, res);
        }
        Bloggify.apis["handlePage:" + req.method](
            req, res, pathName, route, null, isBlogPost, isBlogPage
        );
        return;
    }

    // Serve files
    Statique.serve(req, res);
}).listen(Config.port, Config.ipaddress);

// Print some output
Debug.log(
    "Server running at http://" + (Config.ipaddress || "localhost")
  + ":" + Config.port
  , "info"
);
