// dependencies
var Marked = require("marked")
  , QueryString = require ("querystring")
  , fileCache = {
        dummyPath: {
            ttl: setTimeout (function () {
                delete fileCache["dummyPath"];
            }, Config.gitSite.cache.ttl)
          , content: "Dummy"
        }
    };

const FORMS = {
    "contact": function (req, res, formData) {
        debugger;
    }
  , "login": function (req, res, formData) {

        // username
        if (!formData.username) {
           return Statique.sendRes (res, 400, "text/html", "Missing username");
        }

        // password
        if (!formData.password) {
            return Statique.sendRes (res, 400, "text/html", "Missing password");
        }

        // get user
        var user = SITE_CONFIG.parsed.roots.users[formData.username.toLowerCase()];
        if (!user) {
            return Statique.sendRes (res, 400, "text/html", "Invalid username.");
        }

        // validate password
        if (user.password !== formData.password) {
            return Statique.sendRes (res, 403, "text/html", "Invalid password.");
        }

        Statique.sendRes (res, 200, "text/html", "Successfully logged in");
    }
};

/**
 *  This function reads a file from hard disk or from cache
 *  deleting it after the ttl timeout expires.
 *
 */
function readFile (path, callback) {

    // try to get the file from cache
    var fromCache = fileCache[path];
    if (fromCache) {

        // reset timeout
        fromCache.ttl = setTimeout (function () {
            console.log("Deleting " + path);
            delete fileCache[path]
        }, Config.gitSite.cache.ttl);

        // callback content
        return callback (null, fromCache.content);
    }

    // read file using statique
    Statique.readFile (path, function (err, content) {

        if (err) {
            return callback (err);
        }

        fileCache[path] = {
            ttl: setTimeout (function () {
                console.log("Deleting " + path);
                delete fileCache[path];
            }, Config.gitSite.cache.ttl)
          , content: content
        };

        callback (null, content.toString());
    });
}

/**
 *  Get form data for POST requests
 *
 */
function getFormData (req, callback) {

    var formData = ""
      , error = ""
      ;

    req.on ("data", function (data) {
        formData += data;
    });

    req.on ("error", function (data) {
        error += data;
    });

    req.on ("end", function (data) {

        if (error) {
            return callback (error);
        }

        callback (null, QueryString.parse (formData));
    });
}

/**
 *  Handle GET requests
 *
 */
module.exports["handlePage:GET"] = function (req, res, pathName, route) {

    // handle core pages
    if (route.indexOf("/core") !== 0) {
        // build the route
        route = SITE_CONFIG.paths.roots.pages + route;
    }

    // read file
    readFile (route, function (err, fileContent) {

        if (err) {
            console.error (err);
            return Statique.sendRes (res, 500, "html", "Internal server error");
        }

        // convert page object to array
        var pageArray = []
          , pages = SITE_CONFIG.parsed.roots.pages
          , pageHtml = "";
          ;

        for (var url in pages) {
            var cPage = JSON.parse(JSON.stringify(pages[url]));
            cPage.url = url;
            pageArray.push (cPage);
        }

        pageArray.sort (function (a, b) {
            return (a.order || 0) > (b.order || 0);
        });

        for (var i = 0; i < pageArray.length; ++i) {
            var cPageObj = pageArray[i];
            if (cPageObj.visible === false) { continue; }
            pageHtml +=
                "<li class='page'>\n"
              + "    <a href='" + cPageObj.url + "'>" + cPageObj.label + "</a>\n"
              + "</li>\n";
        }

        // success response
        Statique.sendRes (res, 200, "text/html",
            SITE_CONFIG.parsed.roots.template.page.replace (
                "{{PAGE_CONTENT}}"
              , Marked (fileContent)
            ).replace(
                "{{TITLE}}"
              , SITE_CONFIG.title
            ).replace(
                "{{PAGES}}"
              , pageHtml
            )
        );
    });
};

/**
 *  Handle POST requests
 *
 */
module.exports["handlePage:POST"] = function (req, res, pathName, route) {

    // get form data
    getFormData (req, function (err, formData) {

        if (err) {
            console.error (err);
            return res.end ("Internal server error");
        }

        if (Object.keys(FORMS).indexOf(formData.formId) !== -1) {
            return FORMS[formData.formId](req, res, formData);
        }

        return Statique.sendRes (res, 400, "text/html", "Invalid or missing form id");
    });
};
