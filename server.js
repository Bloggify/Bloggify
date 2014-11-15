// Dependencies
var Lien = require("lien")
  , Url = require("url")
  , Start = require("./lib/config")
  , Config = Bloggify.getConfig()
  , Theme = require(Bloggify.PATH_LIB + "/theme")
  , CoreApis = null
  ;

// Init lien server
var server = Bloggify.server = new Lien({
    host: Config.host
  , port: Config.port
  , root: Config.pathContent
  , cache: Config.fileCache
});

// Init databases
Bloggify.initDbs(function (err) {
    if (err) { throw err; }

    // Init plugins
    Bloggify.initPlugins(function (err) {
        if (err) { throw err; }

        // Init theme
        Theme(Config.pathContent + Config.theme, function (err, themeObj) {
            if (err) { throw err; }

            // Attach the theme object
            Bloggify.theme = themeObj;

            // Initialize core apis
            CoreApis = require("./lib");

            // Error pages
            server._sServer.setErrors(themeObj.errors);
            server.page.add(/^\/[4-9][0-9][0-9]\/?$/, CoreApis.errorPages);

            // Blog articles
            server.page.add(new RegExp(Config.blog.path + "\/[0-9]+.*\/?$"), CoreApis.blogArticle);

            // Blog pages (pagination)
            server.page.add(new RegExp(Config.blog.path + "(\/page\/[1-9]([0-9]*))?\/?$"), CoreApis.blogPage);

            // Site pages
            server.page.add(/^(\/[a-z0-9-]+)?\/?$/, CoreApis.sitePage);

            // Other requests (CSS etc)
            server.on("request", function (lien) {
                lien.end();
            });
        });
    });
});
