var Marked = require("marked")
  , fileCache = {
        dummyPath: {
            ttl: setTimeout (function () {
                delete fileCache["dummyPath"];
            }, Config.gitSite.cache.ttl)
          , content: "Dummy"
        }
    };

function readFile (path, callback) {

    var fromCache = fileCache[path];
    if (fromCache) {

        // update ttl
        fromCache.ttl = setTimeout (function () {
            console.log("Deleting " + path);
            delete fileCache[path]
        }, Config.gitSite.cache.ttl);

        // callback content
        return callback (null, fromCache.content);
    }

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

module.exports["handlePage"] = function (req, res, pathName, route) {
    route = SITE_CONFIG.paths.roots.pages + route;
    readFile (route, function (err, fileContent) {

        if (err) {
            console.error (err);
            return Statique.sendRes (res, 500, "html", "Internal server error");
        }

        Statique.sendRes (res, 200, "text/html",
            SITE_CONFIG.parsed.roots.template.page.replace (
                "{{PAGE_CONTENT}}"
              , Marked (fileContent)
            ).replace(
                "{{TITLE}}"
              , SITE_CONFIG.title
            )
        );
    });
};
