var Plugin = module.exports = {};

Plugin.install = function(pluginObj, callback) {

    // Clone plugin
    Git.clone({
        repo: pluginObj.source || pluginObj
      , dir: pluginObj.path
      , depth: 1
    }, function (err, repository) {
        if (err) { return callback(err); }
        Debug.log("Successfully downloaded " + pluginObj.name + " plugin.", "info");

        // Set version/branch
        repository.exec("checkout", pluginObj.version, function (err, output) {
            if (err) { return callback(err); }

            // Get package.json file
            var packageJson = Utils.requireNoCache(pluginObj.path + "/package.json")
              , deps = packageJson.dependencies || {}
              , packages = []
              ;

            for (var d in deps) {
                packages.push(d + "@" + deps[d]);
            }

            // Install plugin dependencies
            Npm.load({prefix: pluginObj.path + "/node_modules"}, function (err) {
                if (err) { return callback(err); }
                Npm.commands.install(packages, function (err, data) {
                    if (err && err.code !== "ENOPACKAGEJSON") { return callback(err); }
                    Utils.requireNoCache(pluginObj.path);

                    callback(null, null);
                });
            });
        });
    });
};

Plugin.installAll = function(options, callback) {

    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    var remaining = Object.keys(Config.plugins).length
      , callbacked = false
      , singleCallback = function (err, data) {
            if (callbacked) { return; }
            callback(err, data);
        }
      ;

    if (!Config.plugins) {
        return singleCallback(null, null);
    }

    // Init plugins
    for (var plugin in Config.plugins) {
        (function (cPlugin, plugin) {

            // Output
            Debug.log("Downloading " + plugin + " plugin.", "info");

            // Compute path to plugin and check
            var pathToPlugin = Config.root + "/plugins/" + plugin;
            if (Fs.existsSync(pathToPlugin)) {
                Utils.requireNoCache(pathToPlugin);
                Debug.log("Plugin already exists: " + plugin, "warn");
                return;
            }

            // Attach path to plugin
            cPlugin.path = pathToPlugin;

            // Install plugin
            Plugin.install(cPlugin, function (err) {
                if (err) { return singleCallback(err); }
                if (--remaining === 0) {
                    singleCallback(null, null);
                }
            });
        })(Config.plugins[plugin], plugin)
    }
};
