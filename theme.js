var Utils = require("./utils");

const DEFAULT_THEME_CONFIG = {
    errors: {
        "403": "/403.html"
      , "404": "/404.html"
      , "500": "/500.html"
    }
  , main: "index.jade"
};

var Theme = module.exports = function (path, callback) {

    debugger;
    path += "/package.json";
    var themeObj = {};

    try {
        themeObj.npm = require(path);
    } catch (e) {
        return callback(e);
    }

    themeObj.config = Utils.mergeRecursive(
        DEFAULT_THEME_CONFIG
      , themeObj.npm.bloggify
    );

    for (var err in themeObj.config.errors) {
        themeObj.config.errors[err] =
            Bloggify._config.theme + themeObj.config.errors[err];
    }

    callback(null, themeObj.config);
};
