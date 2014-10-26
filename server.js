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

    // Error pages
    server.page.add(/\/[4-9][0-9][0-9]\//, function (lien) {
        lien.end();
    });

    // Blog posts
    server.page.add(new RegExp(Config.blog.path + "\/[0-9]+.*"), function (lien) {
        debugger;
        lien.end();
    });

    // Blog pages
    server.page.add(new RegExp(Config.blog.path + "(\/page\/[1-9]([0-9]*))?\/$"), function (lien) {
        debugger;
        lien.end();
    });

    server.on("request", function (lien) {
        lien.end();
    });

   //     if (
   //         (route && route.url && typeof route.url !== "object"
   //         || isBlogPost || isBlogPage)
   //         && typeof Bloggify.apis["handlePage:" + req.method] === "function"
   //     ) {
   //         Bloggify.session.isLoggedIn(req, function (err, sessionData) {
   //             if (err) {
   //                 Debug.log(err, "error");
   //                 return Statique.error(req, res, 500);
   //             }
   //             Bloggify.apis["handlePage:" + req.method](
   //                 req, res, pathName, route, null, isBlogPost, isBlogPage, sessionData
   //             );
   //         });
   //         return;
   //     }
});
