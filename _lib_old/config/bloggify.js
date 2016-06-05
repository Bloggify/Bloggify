// Dependencies
var Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Path = require("path")
  ;

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
