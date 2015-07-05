// Dependencies
var Git = require("git-tools")
  , IsThere = require("is-there")
  , Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Utils = require(Bloggify.PATH_UTIL)
  , Exec = require("child_process").exec
  , Path = require("path")
  , OneByOne = require("one-by-one")
  ;

// Plugin constructor
var Plugin = module.exports = {};

/**
 * getPath
 * Returns the path to the plugin directory.
 *
 * @name getPath
 * @function
 * @param {Object} p The plugin object.
 * @return {String} The absolute path to the plugin directory.
 */
Plugin.getPath = function (p) {
    return Path.join(Bloggify.paths.plugins, p.name);
};

/**
 * exists
 * Returns a boolean value indicating if the plugin is installed.
 *
 * @name exists
 * @function
 * @param {Object} p The plugin object.
 * @return {Boolean} `true`, if the plugin is installed, otherwise `false`.
 */
Plugin.exists = function (p) {
    var path = Plugin.getPath(p);
    return IsThere(path);
};

/**
 * getScope
 * Returns the scope object that will be used for initializing the plugin.
 *
 * @name getScope
 * @function
 * @param {Object} p The plugin object.
 * @return {EventEmitter} The plugin scope.
 */
Plugin.getScope = function (p) {
    var scope = new EventEmitter();
    scope.path = function (opt_p) {
        return Plugin.getPath(opt_p || p);
    };
    scope.plugin = p;
    return scope;
};

/**
 * init
 * Inits the plugin.
 *
 * @name init
 * @function
 * @param {Object} p The plugin object.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Plugin.init = function (p, callback) {

    var path = Plugin.getPath(p)
      , main = require(path + "/" + p.main)
      , init = typeof main === "function" ? main : main.init
      ;

    Bloggify.log("Initializing plugin: " + p.name, "info");
    if (typeof init === "function") {

        var scope = Bloggify.plugins[p.name] = Plugin.getScope(p);

        init.call(scope, p.config, function (err) {
            callback(err);
        });

        if (init.length < 2) {
            callback(null);
        }
    } else {
        callback(null);
    }
};

/**
 * install
 * Installs a plugin.
 *
 * @name install
 * @function
 * @param {Object} p The plugin object.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Plugin.install = function (p, callback) {
    var where = Plugin.getPath(p);
    Bloggify.log("Clonning plugin: " + p.name, "info");
    Git.clone({
        repo: p.source
      , dir: where
    }, function (err, repository) {
        if (err) { return callback(err); }

        repository.tags(function (err, tags) {
            if (err) { return callback(err); }

            function checkout() {
                repository.exec("checkout", p.version, function (err) {
                    if (err) { return callback(err); }
                    var packageJson = where + "/package.json";
                    p.main = Object(Utils.readJson(packageJson)).main || "index.js";
                    if (IsThere(packageJson)) {
                        Bloggify.log("Running npm install: " + p.name, "info");
                        Exec("npm install", {cwd: where}, function (err, stdout) {
                            if (err) { return callback(err); }
                            callback(null, stdout);
                        });
                    }
                });
            }

            // Not a tag, maybe it's a branch
            if (tags.map(function (c) { return c.name; }).indexOf(p.version) === -1) {
                repository.exec("checkout", "-B", p.version, function (err) {
                    if (err) { return callback(err); }
                    repository.exec("pull", "origin", p.version, function (err) {
                        if (err) { return callback(err); }
                        checkout();
                    });
                });
            } else {
                checkout();
            }
        });
    });
};

/**
 * update
 * Updates a plugin.
 *
 * @name update
 * @function
 * @param {Object} p The plugin object.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Plugin.update = function (p, callback) {
    // TODO npm update, pull, checkout
    var where = Plugin.getPath(p);
    var packageJson = where + "/package.json";
    p.main = Object(Utils.readJson(packageJson)).main || "index.js";

    Bloggify.log("Updating plugin: " + p.name, "info");
    callback(null, null);
}

/**
 * updateOrInstall
 * Updates or installs a plugin.
 *
 * @name updateOrInstall
 * @function
 * @param {Object} p The plugin object.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
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

/**
 * initPlugins
 * Inits all plugins from configuration.
 *
 * @name initPlugins
 * @function
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
Plugin.initPlugins = function (callback) {

    var plugins = Bloggify.config.plugins;
    Bloggify.plugins = {};

    if (!plugins.length) {
        return callback(null, {});
    }

    OneByOne(plugins.map(Plugin.updateOrInstall, callback);
};
