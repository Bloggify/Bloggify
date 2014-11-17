var Marked = require("marked")
  , Cache = require("../common/cache")
  ;

var SitePage = module.exports = function (lien) {

    var path = lien.pathName.replace(/\/$/g, "") || "/";

    Cache.page(function (err, pages) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        Cache.page({path: path}, { markdown: true, noBlog: true }, function (err, page) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end(500);
            }

            if (!page.length) { return lien.end(404); }
            page = page[0];


            Bloggify.render(lien, {
                type: "sitePage"
              , data: {
                    content: page.content
                  , menu: {
                        pages: pages
                      , active: page
                    }
                  , title: page.title
                }
            });
        });
    });
};
