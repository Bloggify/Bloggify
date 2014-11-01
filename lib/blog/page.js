var Cache = require("../common/cache");

function getPostsContent(posts, callback) {
    var length = posts.length
      , complete = 0
      , already = false
      ;

    function clb(err, data) {
        if (already) { return; }
        callback(err, data);
    }

    function readFile(cPost) {
        Cache.file(Bloggify._config.posts  + "/" + cPost.id + ".md"
            , { markdown: true }
            , function (err, content) {
            if (err) { return clb(err); }
            cPost.markdown = content;
            if (++complete === length) {
                return callback(null, posts);
            }
        });
    }

    for (var i = 0; i < length; ++i) {
        readFile(posts[i]);
    }
}

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

        Bloggify.posts.find({}, {
            skip: pageNumber - 1
          , limit: Bloggify._config.blog.posts.limit
        }).toArray(function (err, posts) {

            if (err) {
                Bloggify.log(err, "error");
                return lien.end(500);
            }

            getPostsContent(posts, function (err) {

                if (err) {
                    Bloggify.log(err, "error");
                    return lien.end(500);
                }

                lien.end(posts);
            });
        });
    });
};
