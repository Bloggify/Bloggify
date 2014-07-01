var File = module.exports = {};

/**
 * readFile
 * This function reads a file from hard disk or from cache
 * deleting it after the ttl timeout expires.
 *
 * @name readFile
 * @function
 * @param {String} path path that will be passed to Statique
 * @param {Function} callback the callback function
 * @return
 */
File.read = function (path, callback) {

    // Try to get the file from cache
    var fromCache = Statique._fileCache[path];
    if (fromCache) {

        // reset timeout
        fromCache.ttl = setTimeout(
            Statique._fileCache._removePath
          , Config.site.cache.ttl
        );

        // callback content
        return callback(null, fromCache.content);
    }

    // Read file using statique
    Statique.readFile(path, function (err, content) {
        if (err) { return callback(err); }

        Statique._fileCache[path] = {
            ttl: setTimeout(function () {
                delete Statique._fileCache[path];
            }, Config.site.cache.ttl)
          , content: content
        };

        callback(null, content.toString());
    });
};
