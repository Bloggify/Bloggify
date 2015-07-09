// Dependencies
var Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Path = require("path")
  ;

// Create the global Bloggify variable and PATH_* fields
module.exports = global.Bloggify = new EventEmitter();

// Attach constants
Bloggify.ROOT = Path.join(__dirname, "../..");
Bloggify.PATH_LIB = Bloggify.ROOT + "/lib";
Bloggify.PATH_UTIL = Bloggify.PATH_LIB + "/util";

// Bloggify processors
Bloggify.processors = {
    // Specific page
    sitePage: {
        "/dummyPage": []
    }
    // Article pages
  , article: []

    // Blog page
  , blog: []

    // Just everything
  , all: []
};

// Bloggify paths
Bloggify.paths = {
    site_dir: ""
  , plugins: ""
  , root: Path.join(__dirname, "../..")
};

Bloggify.paths.lib = Bloggify.paths.root + "/lib";
Bloggify.paths.util = Bloggify.paths.root + "/util";
