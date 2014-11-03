var Fs = require("fs")
  , Git = require("git-tools")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Utils = require("../../utils")
  , Exec = require("child_process").exec
  ;

var Plugin = module.exports = {};

Plugin.getPath = function (p) {
    // TODO Default name from git url
    return Bloggify.ROOT + "/plugins/" + p.name;
};

Plugin.exists = function (p) {
    var path = Plugin.getPath(p);
    return Fs.existsSync(path);
};

Plugin.getScope = function (p) {
    var scope = new EventEmitter();
    scope.path = function (opt_p) {
        return Plugin.getPath(opt_p || p);
    };
    scope.plugin = p;
    return scope;
};

Plugin.init = function (p, callback) {

    var path = Plugin.getPath(p)
      , main = require(path + "/" + p.main)
      , init = typeof main === "function" ? main : main.init
      ;

    Bloggify.log("Initializing plugin: " + p.name, "info");
    if (typeof init === "function") {

        init.call(Plugin.getScope(p), p.config, function (err) {
            callback(err);
        });

        if (init.length < 2) {
            callback(null);
        }
    } else {
        callback(null);
    }
};

Plugin.install = function (p, callback) {
    var where = Plugin.getPath(p);
    Bloggify.log("Clonning plugin: " + p.name, "info");
    Git.clone({
        repo: p.source
      , dir: where
      , depth: 1
    }, function (err, repository) {
        if (err) { return callback(err); }
        repository.exec("checkout", p.version, function (err) {
            if (err) { return callback(err); }
            var packageJson = where + "/package.json";
            p.main = Object(Utils.readJson(packageJson)).main || "index.js";
            if (Fs.existsSync(packageJson)) {
                Bloggify.log("Running npm install: " + p.name, "info");
                Exec("npm install", {cwd: where}, function (err, stderr, stdout) {
                    if (err) { return callback(err); }
                    if (stderr) { return callback(new Error(stderr)); }
                    callback(null, stdout);
                });
            }
        });
    });
};

Plugin.update = function (p, callback) {
    // TODO npm update, pull, checkout
    var where = Plugin.getPath(p);
    var packageJson = where + "/package.json";
    p.main = Object(Utils.readJson(packageJson)).main || "index.js";

    Bloggify.log("Updating plugin: " + p.name, "info");
    callback(null, null);
}

Plugin.updateOrInstall = function (p, callback) {

    if (Plugin.exists(p)) {
        Plugin.update(p, function (err) {
            if (err) { return callback(err); }
            Plugin.init(p, callback);
        });
        return;
    }

    Plugin.install(p, function (err) {
        if (err) { return callback(err); }
        Plugin.init(p, callback);
    });
};

Plugin.initPlugins = function (callback) {

    var plugins = Bloggify._config.plugins;

    if (!plugins.length) {
        return callback(null, {});
    }

    function installSeq(index) {
        index = index || 0;
        var cPlugin = plugins[index];
        if (!cPlugin) {
            return callback(null, plugins);
        }

        Plugin.updateOrInstall(cPlugin, function (err) {
            if (err) { return callback(err); }
            installSeq(index + 1);
        });

    }

    installSeq();
};
