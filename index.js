// Dependencies
var B = global.Bloggify = new (require("events").EventEmitter)();
B._config = { root: __dirname };
B._deps = {};
B._deps.statique = require("statique");
B._deps.utils = require("./utils");
B._deps.fs = require("fs");
B._deps.url = require("url");
B._deps.http = require("http");
B._deps.marked = require("marked");
B._deps.moment = require("moment");
B._deps.mustache = require("mustache");
B._deps.queryString = require("querystring");
B._deps.bugKiller = B.debug = require("bug-killer");
B._deps.validators = require("./apis/validators");
B._deps.highlight = require("highlight.js");
B._deps.jsonDB = require("mongo-sync-files");
B._deps.gitTools = require("git-tools");
B._deps.npm = require("npm");
B._deps.events = require("events");

B._deps.lib = require("./lib");

// Start core
Bloggify.start();
B._config.root = __dirname;

// Require apis after Config was inited
Bloggify.apis = require("./apis")

// Create server
B._deps.http.createServer(function(req, res) {

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
      , isBlogPost = false
      , isBlogPage = false
      , siteBlog = B._config.site.blog
      ;

    if (siteBlog) {
        isBlogPost = (
            new RegExp(siteBlog.url + "\/[0-9]+.*")
        ).test(pathName);
        isBlogPage = new RegExp(
            siteBlog.url + "(\/page\/[1-9]([0-9]*))?\/$"
        ).test(pathName);
    }

    if (
        (route && route.url && typeof route.url !== "object"
        || isBlogPost || isBlogPage)
        && typeof Bloggify.apis["handlePage:" + req.method] === "function"
    ) {
        Bloggify.session.isLoggedIn(req, function (err, sessionData) {
            if (err) {
                Bloggify.debug.log(err, "error");
                return Statique.error(req, res, 500);
            }
            Bloggify.apis["handlePage:" + req.method](
                req, res, pathName, route, null, isBlogPost, isBlogPage, sessionData
            );
        });
        return;
    }

    // Serve files
    Statique.serve(req, res);
}).listen(B._config.port, B._config.ipaddress);

// Print some output
Bloggify.debug.log(
    "Server running at http://" + (B._config.ipaddress || "localhost")
  + ":" + B._config.port
  , "info"
);
