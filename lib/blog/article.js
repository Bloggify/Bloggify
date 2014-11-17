var Cache = require("../common/cache");

const article_ID_REGEX = new RegExp("^" + Bloggify.config.blog.path + "\/([0-9]+).*");

var BlogArticle = module.exports = function (lien) {
    var articleId = parseInt((lien.pathName.match(article_ID_REGEX) || [])[1]);
    if (isNaN(articleId)) {
        return lien.end(404);
    }

    Cache.article({
        id: articleId
    }, function (err, article) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        if (!article || !article.length) {
            return lien.end(404);
        }

        article = article[0];

        Bloggify.render(lien, {
            type: "article"
          , data: {
                article: article
              , title: article.title
            }
        });
    });
};
