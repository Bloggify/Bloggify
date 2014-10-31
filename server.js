// Dependencies
var Statique = require("statique")
  , Start = require("./start")
  , Http = require("http")
  , Url = require("url")
  , Lien = require("lien")
  , Config = Bloggify.getConfig()
  , Theme = require("./theme")
  , CoreApis = null
  ;

// Init lien server
var server = Bloggify.server = new Lien({
    host: Config.host
  , port: Config.port
  , root: Config.content
  , cache: Config.fileCache
});

// Init databases
Bloggify.initDbs(function (err) {
    if (err) { throw err; }

    // Init plugins
    Bloggify.initPlugins(function (err) {
        if (err) { throw err; }

        // Init theme
        Theme(Config.content + Config.theme, function (err, themeObj) {
            if (err) { throw err; }

            Bloggify.theme = themeObj;
            CoreApis = require("./lib");

            // Error pages
            server._sServer.setErrors(themeObj.errors);
            server.page.add(/^\/[4-9][0-9][0-9]\/$/, CoreApis.errorPages);

            // Blog posts
            server.page.add(new RegExp(Config.blog.path + "\/[0-9]+.*\/$"), CoreApis.blogPost);

            // Blog pages (pagination)
            server.page.add(new RegExp(Config.blog.path + "(\/page\/[1-9]([0-9]*))?\/$"), CoreApis.blogPage);

            // Site pages
            server.page.add(/^(\/[a-z0-9-]+)?\/$/, CoreApis.sitePage);

            // Other requests (CSS etc)
            server.on("request", function (lien) {
                lien.end();
            });
        });
    });
});
