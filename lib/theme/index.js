var Utils = require(Bloggify.PATH_UTIL)
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
    Fs.readFile(path + "/package.json", "utf-8", function (err, themePackage) {
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

        for (var err in themeObj.errors) {
            themeObj.errors[err] = Bloggify.config.theme + themeObj.errors[err];
        }

        var mainFile = path + "/" + themeObj.main;
        themeObj.render = Jade.compileFile(mainFile);
        var timeout = null;
        Fs.watch(path, function (event, filename) {
            if (event !== "change") { return; }
            if (!/.jade$/.test(filename)) { return; }
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                themeObj.render = Jade.compileFile(mainFile);
            }, 1000);
        });

        callback(null, themeObj);
    });
};
