var Cache = require("../common/cache");

var BlogPage = module.exports = function (lien) {

    var pageNumber = parseInt((lien.pathName.match(/[1-9]([0-9]*)/) || [])[0]);
    if (isNaN(pageNumber)) {
        pageNumber = 1;
    }

    Cache.page(function (err, pages) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        var articleLimit = Bloggify.config.blog.articles.limit;
        Cache.article({}, {
            skip: (pageNumber - 1) * articleLimit
          , limit: articleLimit
        }, {markdown: true}, function (err, articles) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end(500);
            }

            if (!articles || !articles.length) {
                return lien.end(404);
            }

            Bloggify.articles.count(function (err, count) {

                if (err) {
                    Bloggify.log(err, "error");
                    return lien.end(500);
                }

                var renderData = {
                    type: "blog"
                  , lien: lien
                  , config: Bloggify.config
                  , require: require
                  , data: {
                        menu: {
                            pages: pages
                          , active: Bloggify.config.blog
                        }
                      , title: Bloggify.config.blog.title
                      , articles: articles
                      , page: {
                            next: pageNumber + 1
                          , active: pageNumber
                          , previous: pageNumber - 1
                          , count: Math.ceil(count / articleLimit)
                        }
                    }
                };

                var page = renderData.data.page;
                if (page.next > page.count) {
                    delete page.next;
                }

                if (page.previous <= 0) {
                    delete page.previous;
                }

                lien.end(Bloggify.theme.render(renderData));
            });
        });
    });
};
