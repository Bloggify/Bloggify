// Dependencies
var Utils = require(Bloggify.PATH_UTIL)
  , Jade = require("jade")
  , Fs = require("fs")
  , Exec = require("child_process").exec
  , Watch = require("fwatcher")
  ;

// Constants
const DEFAULT_THEME_CONFIG = {
    errors: {
        "403": "/403.html"
      , "404": "/404.html"
      , "500": "/500.html"
    }
  , main: "index.jade"
};

/**
 * Theme
 * The theme factory.
 *
 * @name Theme
 * @function
 * @param {String} path The path to the theme.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
var Theme = module.exports = function (path, callback) {
    Fs.readFile(path + "/package.json", "utf-8", function (err, themePackage) {
        if (err) { return callback(err); }
        try {
            themePackage = JSON.parse(themePackage);
        } catch (e) {
            return callback(e);
        }

        var themeObj = Utils.mergeRecursive(
            themePackage.bloggify
          , DEFAULT_THEME_CONFIG
        );

        for (var err in themeObj.errors) {
            themeObj.errors[err] = Bloggify.config.theme + themeObj.errors[err];
        }

        var mainFile = path + "/" + themeObj.main;
        themeObj.render = Jade.compileFile(mainFile);
        var timeout = null;
        Watch(path, function (err, event, filename) {
            if (err) { return Bloggify.log(err); }
            if (event !== "change") { return; }
            if (!/.jade$/.test(filename)) { return; }
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                themeObj.render = Jade.compileFile(mainFile);
            }, 1000);
        });

        Exec("npm install", {cwd: path}, function (err, stdout) {
            if (err) { return callback(err); }
            callback(null, themeObj);
        });
    });
};
