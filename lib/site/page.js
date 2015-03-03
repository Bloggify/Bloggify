// Dependencies
var Marked = require("marked")
  , Cache = require("../common/cache")
  ;

/**
 * SitePage
 * The site page router.
 *
 * @name SitePage
 * @function
 * @param {Lien} lien The lien object.
 * @return {undefined}
 */
var SitePage = module.exports = function (lien) {
    // TODO Async

    // Get the pathname
    var path = lien.pathName.replace(/\/$/g, "") || "/";

    // Get pages
    Cache.page(function (err, pages) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        // Get the current page
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
