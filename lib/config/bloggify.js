var Events = require("events")
  , EventEmitter = Events.EventEmitter
  , Debug = require("bug-killer")
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

// Log function
Bloggify.log = Debug.log;

// Bloggify processors
Bloggify.processors = {
    sitePage: {
        "/dummyPage": []
    }
  , article: []
  , blog: []
};

Bloggify.render = function (lien, data) {
    var content = Bloggify.theme.render(data);
    var processor = Bloggify.processors[data.type];

    function processContent(arr) {
        var complete = 0;
        function checkComplete() {
            if (++complete === arr.length) {
                lien.end(content);
            }
        }
        for (var i = 0; i < arr.length; ++i) {
            var cFun = arr[i];
            if (typeof cFun !== "function") {
                checkComplete();
                continue;
            }
            if (cFun.length <= 3) {
                content = cFun(lien, data, content);
                checkComplete();
            } else {
                cFun(lien, data, content, function (nc) {
                    content = nc;
                    checkComplete();
                });
            }
        }
    }

    if (data.type === "sitePage" && processor[lien.pathName] && processor[lien.pathName].length) {
        processContent(processor[lien.pathName]);
    } else if (processor && processor.length) {
        processContent(processor);
    } else {
        lien.end(content);
    }
};
