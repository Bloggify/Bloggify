var BlogPage = module.exports = function (lien) {

    var pageNumber = parseInt((lien.pathName.match(/[1-9]([0-9]*)/) || [])[0]);
    if (isNaN(pageNumber)) {
        pageNumber = 1;
    }

    Bloggify.pages.find({}).toArray(function (err, pages) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        Bloggify.pages.find({}, {
            skip: pageNumber - 1
          , limit: Bloggify._config.blog.posts.limit
        }).toArray(function (err, posts) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end(500);
            }

            lien.end(posts);
        });
    });
};
