var Utils = require("./utils")
  , Jade = require("jade")
  , Fs = require("fs")
  ;

const DEFAULT_THEME_CONFIG = {
    errors: {
        "403": "/403.html"
      , "404": "/404.html"
      , "500": "/500.html"
    }
  , main: "index.jade"
};

var Theme = module.exports = function (path, callback) {

    path += "/package.json";

    Fs.readFile(path, "utf-8", function (err, themePackage) {
        if (err) { return callback(err); }
        try {
            themePackage = JSON.parse(themePackage);
        } catch (e) {
            return callback(e);
        }

        var themeObj = Utils.mergeRecursive(
            DEFAULT_THEME_CONFIG
          , themePackage.bloggify
        );

        for (var err in themeObj.config.errors) {
            themeObj.config.errors[err] =
                Bloggify._config.theme + themeObj.config.errors[err];
        }

        themeObj.main = jade.compileFile(path + themeObj.main, options);

        callback(null, themeObj.config);
    });
};
