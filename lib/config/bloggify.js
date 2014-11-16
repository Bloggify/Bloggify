// Dependencies
var Events = require("events")
  , EventEmitter = Events.EventEmitter
  , JsonDB = require("mongo-sync-files")
  , Path = require("path")
  ;

// Create the global Bloggify variable and PATH_* fields
module.exports = global.Bloggify = new EventEmitter();

// Attach constants
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