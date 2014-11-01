var Marked = require("marked")
  , Cache = require("../common/cache")
  ;

var SitePage = module.exports = function (lien) {
    var path = lien.pathName.replace(/\/$/g, "") || "/";
    Bloggify.pages.find({}).toArray(function (err, pages) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        Bloggify.pages.findOne({path: path}, function (err, page) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end(500);
            }

            if (!page) { return lien.end(404); }
            Cache.file(Bloggify._config.pages + "/" + page.slug + ".md", {markdown: true}, function (err, content) {
                if (err) { return lien.end(404); }
                lien.end(Bloggify.theme.render({
                    type: "sitePage"
                  , config: Bloggify._config
                  , data: {
                        content: content
                      , menu: {
                            pages: pages
                          , active: page
                        }
                      , title: page.label
                    }
                }));
            });
        });
    });
};
