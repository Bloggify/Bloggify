var CoreApis = module.exports = {};
CoreApis.errorPages = function (lien) {
    var code = parseInt((lien.pathName.match(/\/(.*)\/?/) || [])[1]);
    if (isNaN(code) || !Bloggify.theme.errors[code]) {
        return lien.end(404);
    }
    lien.file(Bloggify.theme.errors[code]);
};

CoreApis.blogArticle = require("./blog/article");
CoreApis.blogPage = require("./blog/page");
CoreApis.sitePage = require("./site/page");
