var Url = require('url');

// dependencies
var JohnnysStatic = require ("johnnys-node-static")
  , Http = require ("http")
  , Apis = require ("./apis")
  , Config = require ("./config.js")
  , Marked = require("marked")
  , port = process.env.PORT || 8080
  ;

  debugger;
JohnnysStatic.setStaticServer({root: Config.gitSite.path});
JohnnysStatic.setRoutes(Config.gitSite.parsed.roots.pages);

// create server
Http.createServer (function(req, res) {

    // get the url
    var pathName = Url.parse(req.url, true).pathname;

    // verify if it doesn't end with '/'
    if (pathName.slice(-1) !== "/") {
        // if yes, add '/'
        pathName += "/";
    }

    debugger;

    // if it exists
    if (JohnnysStatic.exists(req, res)) {

        // serve the file
        JohnnysStatic.serve(req, res, function (err) {

            // not found error
            if (err.code === "ENOENT") {
                res.end("404 - Not found.");
            }

            // other error
            res.end(err.toString());
        });

        return;
    }

    // maybe the route is an api url
    var api = Apis[pathName];
    if (typeof api === "function") {
        api (req, res);
        return;
    }

    // serve file
    JohnnysStatic.serveAll(req, res, function(err, result) {
        // check for error
        if (err) {
            res.writeHead(err.status, err.headers);
            res.end();
        } else {
            console.log('%s - %s', req.url, result.message);
        }
    });
}).listen(port);

// print some output
console.log('node-static running at http://localhost:%d', port);
