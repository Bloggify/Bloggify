// Dependencies
var Cache = require("../common/cache");

// Constants
const article_ID_REGEX = Bloggify.config.blog.path === "/"
    ? (
        Bloggify.config.blog.slug
      ? new RegExp("^/" + Bloggify.config.blog.slug + "/([0-9]+).*")
      : new RegExp("^/([0-9]+).*")
    )
    : new RegExp("^" + Bloggify.config.blog.path + "/([0-9]+).*")
    ;

/**
 * BlogArticle
 * The article router.
 *
 * @name BlogArticle
 * @function
 * @param {Lien} lien The lien object.
 * @return {undefined}
 */
var BlogArticle = module.exports = function (lien) {

    debugger
    // Get the article id
    var articleId = parseInt((lien.pathName.match(article_ID_REGEX) || [])[1]);
    if (isNaN(articleId)) {
        return lien.end(404);
    }

    // Get the article
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
