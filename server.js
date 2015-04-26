// Dependencies
var BloggifyServer = require("./lib/server");

BloggifyServer.start(__dirname + "/lib/config", function (message) {
    Bloggify.log(message, "info");
}, function (err, data) {
    if (err) {
        return Bloggify.log(err, "error");
    }
    Bloggify.log(data, "info");
});
