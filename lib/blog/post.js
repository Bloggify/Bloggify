var Cache = require("../common/cache");

const POST_ID_REGEX = new RegExp("^" + Bloggify._config.blog.path + "\/([0-9]+).*");

var BlogPost = module.exports = function (lien) {
    var postId = parseInt((lien.pathName.match(POST_ID_REGEX) || [])[1]);
    if (isNaN(postId)) {
        return lien.end(404);
    }

    Cache.post({
        id: postId
    }, function (err, post) {

        if (err) {
            Bloggify.log(err, "error");
            return lien.end(500);
        }

        if (!post || !post.length) {
            return lien.end(404);
        }

        post = post[0];

        var renderData = {
            lien: lien
          , require: require
          , type: "article"
          , config: Bloggify._config
          , data: {
                post: post
            }
        };

        lien.end(Bloggify.theme.render(renderData));
    });
};
