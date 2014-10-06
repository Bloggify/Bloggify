var Statique = require("statique")
  , Start = require("./start")
  , Http = require("http")
  ;

var server = new Statique({root: Bloggify.ROOT + Bloggify.getConfig().content})

Bloggify.initPlugins(function () {
    Http.createServer(function (request, response) {
        server.serve(request, response);
    }).listen(Bloggify._config.port, Bloggify._config.ipaddress);
});
