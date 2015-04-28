var Lien = require("lien")
  , Url = require("url")
  ;

function Server(options) {

}

Server.prototype.start = function (confPath, progress, callback) {

    var Start = require("../config")
      , Config = Bloggify.getConfig(confPath)
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

    progress("Initializing database.");

    // Init databases
    Bloggify.initDbs(function (err) {
        if (err) { return callback(err); }

        // Init plugins
        progress("Initializing plugins.", "info");
        Bloggify.initPlugins(function (err) {
            if (err) { return callback(err); }

            // Init theme
            progress("Initializing theme.", "info");
            Theme(Config.pathContent + Config.theme, function (err, themeObj) {
                if (err) { return callback(err); }

                // Output
                progress("Initializing APIs and server router.", "info");

                // Attach the theme object
                Bloggify.theme = themeObj;

                // Initialize core apis
                CoreApis = require("../");

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

                // Output
                callback(null, "Bloggify platform is started on http://" + (Config.host || "localhost") + ":" + Config.port, "info");
            });
        });
    });
};

module.exports = new Server();
