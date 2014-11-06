// Dependencies
var Debug = Bloggify.debug
  , Config = Bloggify._config
  ;

var Post = module.exports = {};

// Publish post
Post.publish = function (post, callback) {
    var content = post.content
    delete post.content;
    Config.site.parsed.roots.posts.push(post);
    Post.reorder();
    Fs.writeFile(
        Config.root + Config.site.path + Config.site.paths.roots.posts + "/posts.json"
      , JSON.stringify(Config.site.parsed.roots.posts, null, 2)
      , function (err, data) {
            if (err) { return callback(err); }
            Fs.writeFile(
                Config.root + Config.site.path + Config.site.paths.roots.posts + "/" + post.id + ".md"
              , content
              , callback
            )
    });
};

// Edit post
Post.edit = function (req, query, editedPost, callback) {
    var cPost = Post.fetch(req, query, null, null, true);
    if (!cPost) { return Statique.error(req, res, 404); }
    for (var key in editedPost) {
        cPost[key] = editedPost[key] || cPost[key];
    }
    var content = cPost.content;
    delete cPost.content;
    Bloggify.clearCache();

    var pSchema = Config.schemas.post
      , setObject = {}
      ;

    for (var field in pSchema) {
        setObject[field] = cPost[field];
    }

    Post._col.update(query, {$set: setObject}, function (err) {
        if (err) { return callback(err); }
        Fs.writeFile(
            Config.root + Config.site.path + Config.site.paths.roots.posts + "/" + cPost.id + ".md"
          , content
          , callback
        )
    });
};

// Fetch posts
// TODO By query
Post.fetch = function (req, query, fileContent, callback, noAttachContent) {

    callback = callback || function () {};
    query = Object(query);
    var posts = Utils.clone(Config.site.parsed.roots.posts)
      , postId = query.id || req && typeof req.url === "string" && req.url.match(/[0-9]+/)[0]
      ;

    if (query && query.id) {
        postId = query.id;
    }

    if (!postId) { return null; }

    for (var i = 0, cPost; i < posts.length; ++i) {
        cPost = posts[i];
        if (postId.toString() === cPost.id.toString()) {
            return Post.handle(req, cPost, fileContent, callback, noAttachContent);
        }
    }

    return null;
};

// Handle post
Post.handle = function (req, cPost, postContent, callback, noAttachContent) {
    callback = callback || function () {};
    if (typeof postContent === "string") {
        cPost.content = Marked(postContent);
    }
    if (!cPost.content && !postContent && noAttachContent !== true) {
        return Bloggify.file.read(Config.site.paths.roots.posts + "/" + cPost.id + ".md", function (err, postContent) {
            if (err) { return callback(err); }
            Post.handle(req, cPost, postContent, callback);
        });
    }
    cPost.date = Moment(cPost.publishedAt, "DD-MM-YYYY HH:mm").format("dddd, MMMM D YYYY");
    cPost.url = Config.site.blog.url + "/" + cPost.id + "-" + cPost.slug;
    cPost.fullUrl = "http://" + req.headers.host + cPost.url;
    callback(null, cPost);
    return cPost;
};

// Reorder posts
Post.reorder = function () {

    if (!Array.isArray(Config.site.parsed.roots.posts) || !Config.site.parsed.roots.posts.length) {
        delete Config.site.parsed.roots.pages[Config.site.blog.url];
        Config.site.blog = null;
        return;
    }

    Config.site.parsed.roots.posts.sort(function (a, b) {
        if (Moment(a.publishedAt, "DD-MM-YYYY HH:mm") < Moment(b.publishedAt, "DD-MM-YYYY HH:mm")) {
            return 1;
        }
        return -1;
    });
};
