// Dependencies
var Events = require("events")
  , EventEmitter = Events.EventEmitter
  , JsonDB = require("mongo-sync-files")
  , Path = require("path")
  ;

// Create the global Bloggify variable and PATH_* fields
module.exports = global.Bloggify = new EventEmitter();

// Attach constants
// XXX: Will be deprecated
Bloggify.ROOT = Path.join(__dirname, "../..");
Bloggify.PATH_LIB = Bloggify.ROOT + "/lib";
Bloggify.PATH_UTIL = Bloggify.PATH_LIB + "/util";

// Database constructor
Bloggify.db = new JsonDB();

// Bloggify processors
Bloggify.processors = {
    sitePage: {
        "/dummyPage": []
    }
  , article: []
  , blog: []
};

// Bloggify paths
Bloggify.paths = {
    site_dir: ""
  , plugins: ""
  , root: Path.join(__dirname, "../..")
};

Bloggify.paths.lib = Bloggify.paths.root + "/lib";
Bloggify.paths.util = Bloggify.paths.root + "/util";
