var Statique = require("statique")
  , Start = require("./start")
  , Http = require("http")
  , Url = require("url")
  , Lien = require("lien")
  , Config = Bloggify.getConfig()
  ;

var server = new Lien({
    host: Config.host
  , port: Config.port
  , root: Bloggify.ROOT + Config.content
  , cache: Config.fileCache
});

Bloggify.initPlugins(function () {
    server.on("request", function (lien) {

        // Error pages
        if (/\/[4-9][0-9][0-9]\//.test(lien.pathName)) {
            return lien.end();
        }

        var route = server.getRoute(lien.pathName)
          , isBlogPost = false
          , isBlogPage = false
          ;

        if (Bloggify._config.site.blog) {

            // TODO Compute one time, on config
            isBlogPost = (
                new RegExp(Config.blog.path + "\/[0-9]+.*")
            ).test(pathName);

            // TODO Compute one time, on config
            isBlogPage = new RegExp(
                Config.blog.path + "(\/page\/[1-9]([0-9]*))?\/$"
            ).test(pathName);
        }

        if (
            (route && route.url && typeof route.url !== "object"
            || isBlogPost || isBlogPage)
            && typeof Bloggify.apis["handlePage:" + req.method] === "function"
        ) {
            Bloggify.session.isLoggedIn(req, function (err, sessionData) {
                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(req, res, 500);
                }
                Bloggify.apis["handlePage:" + req.method](
                    req, res, pathName, route, null, isBlogPost, isBlogPage, sessionData
                );
            });
            return;
        }

        lien.end();
    });
});
