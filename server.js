var Statique = require("statique")
  , Start = require("./start")
  , Http = require("http")
  , Url = require("url")
  , Lien = require("lien")
  , Config = Bloggify.getConfig()
  , Theme = require("./theme")
  ;

var server = new Lien({
    host: Config.host
  , port: Config.port
  , root: Config.content
  , cache: Config.fileCache
});

Bloggify.initPlugins(function () {
    Theme(Config.content + Config.theme, function (err, themeObj) {
        if (err) { throw err; }

        server._sServer.setErrors(themeObj.errors);

        // Error pages
        server.page.add(/\/[4-9][0-9][0-9]\/?/, function (lien) {
            var m = lien.pathName.match(/\/(.*)\/?/) || []
              , code = parseInt(m[1])
              ;

            if (isNaN(code) || !themeObj.errors[code]) {
                return lien.end(404);
            }
            lien.file(themeObj.errors[code]);
        });

        // Blog posts
        server.page.add(new RegExp(Config.blog.path + "\/[0-9]+.*"), function (lien) {
            debugger;
            lien.end();
        });

        // Blog pages (pagination)
        server.page.add(new RegExp(Config.blog.path + "(\/page\/[1-9]([0-9]*))?\/$"), function (lien) {
            debugger;
            lien.end();
        });

        server.on("request", function (lien) {
            lien.end();
        });
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
