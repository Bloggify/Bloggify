// dependencies
var Marked = require ("marked")
  , Moment = require ("moment")
  , QueryString = require ("querystring")
  , Url = require ("url")
  , fileCache = {
        dummyPath: {
            ttl: setTimeout (function () {
                delete fileCache["dummyPath"];
            }, Config.gitSite.cache.ttl)
          , content: "Dummy"
        }
    };


/**
 * parseCookies
 * This function parses the cookies from request
 *
 * @param request: the request object
 * @return: returns an object containing the cookies and their values
 */
function parseCookies (request) {
    var list = {}
      , rc = request.headers.cookie
      ;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return list;
}

const FORMS = {
    "contact": function (req, res, formData) {
        debugger;
    }
  , "login": function (req, res, formData) {

        // get cookies
        var cookies = parseCookies (req);
        if (sessions[cookies.sid]) {
            return Statique.sendRes (res, 400, "text/html", "You are logged in already.");
        }

        // username
        if (!formData.username) {
           return Statique.sendRes (res, 400, "text/html", "Missing username");
        }

        // password
        if (!formData.password) {
            return Statique.sendRes (res, 400, "text/html", "Missing password");
        }

        // get user
        var user = SITE_CONFIG.parsed.roots.users[formData.username.toLowerCase()];
        if (!user) {
            return Statique.sendRes (res, 400, "text/html", "Invalid username.");
        }

        // validate password
        if (user.password !== formData.password) {
            return Statique.sendRes (res, 403, "text/html", "Invalid password.");
        }

        // valid request
        var sid = "_" + Math.random().toString(36);
        sessions[sid] = {
            id: sid
          , user: user
          , ttl: setTimeout (function () {
                console.log ("Removing session with id: " + sid);
                delete sessions[sid];
            }, Config.gitSite.cache.ttl)
        };

        // set session id cookie
        res.setHeader ("set-cookie", "sid=" + sid);

        // success response
        Statique.sendRes (res, 200, "text/html", "Successfully logged in");
    }
};

/**
 *  This function reads a file from hard disk or from cache
 *  deleting it after the ttl timeout expires.
 *
 */
function readFile (path, callback) {

    // try to get the file from cache
    var fromCache = fileCache[path];
    if (fromCache) {

        // reset timeout
        fromCache.ttl = setTimeout (function () {
            console.log("Removing file from cache: " + path);
            delete fileCache[path]
        }, Config.gitSite.cache.ttl);

        // callback content
        return callback (null, fromCache.content);
    }

    // read file using statique
    Statique.readFile (path, function (err, content) {

        if (err) {
            return callback (err);
        }

        fileCache[path] = {
            ttl: setTimeout (function () {
                console.log("Deleting " + path);
                delete fileCache[path];
            }, Config.gitSite.cache.ttl)
          , content: content
        };

        callback (null, content.toString());
    });
}

function getLatestPosts (skip, limit, callback) {

     skip = skip || 0;
     limit = ((limit || posts.length) + skip) - 1;

     var posts = JSON.parse(JSON.stringify(SITE_CONFIG.parsed.roots.posts))
       , result = []
       , complete = skip
       ;

     if (skip >= limit + 1) {
        return callback (null, []);
     }

     for (var i = skip; i <= limit; ++i) {
         (function (cPost) {

            if (!cPost) {
                if (++complete >= limit) {
                    callback (null, result);
                }
                return;
            }

            var pathToPost = SITE_CONFIG.paths.roots.posts + "/" + cPost.content;
            readFile (pathToPost, function (err, postContent) {
                if (err) { return callback (err); }
                cPost.content = postContent;
                result.push (cPost);
                if (++complete >= limit) {
                    callback (null, result);
                }
            });
         })(posts[i]);
     }
}

/**
 *  Get form data for POST requests
 *
 */
function getFormData (req, callback) {

    var formData = ""
      , error = ""
      ;

    req.on ("data", function (data) {
        formData += data;
    });

    req.on ("error", function (data) {
        error += data;
    });

    req.on ("end", function (data) {

        if (error) {
            return callback (error);
        }

        callback (null, QueryString.parse (formData));
    });
}

/**
 *  Handle GET requests
 *
 */
function handlePageGet (req, res, pathName, route, posts, isBlogPost) {

    // handle core pages
    if (route && route.indexOf("/core") !== 0) {
        // build the route
        route = SITE_CONFIG.paths.roots.pages + route;
    }

    if (pathName.indexOf(SITE_CONFIG.blog.url) === 0 && !posts && !isBlogPost) {
        var urlSearch = QueryString.parse((Url.parse(req.url).search || "").substring(1));
        urlSearch.page = (Math.floor(Number(urlSearch.page)) - 1);
        getLatestPosts (
            urlSearch.page * SITE_CONFIG.blog.posts.limit
          , SITE_CONFIG.blog.posts.limit
          , function (err, data) {
                if (err) {
                    console.error (err);
                    return Statique.sendRes (res, 500, "text/html", "Internal Server Error");
                }

                handlePageGet (req, res, pathName, route, data);
            }
        )
        return;
    }

    // handle blog posts
    if (isBlogPost) {

        var postName = pathName.split("/")[2]
          , post = null
          , allPosts = SITE_CONFIG.parsed.roots.posts;
          ;

        route = SITE_CONFIG.paths.roots.posts + "/" + postName + ".md";

        for (var i = 0; i < allPosts.length; ++i) {
            var cPost = allPosts[i];
            if (postName === cPost.slug) {
                post = cPost;
                break;
            }
        }

        if (!post || !postName) {
            return Statique.sendRes (res, 404, "text/html", "Post not found");
        }
    }

    // read file
    readFile (route, function (err, fileContent) {

        if (err) {
            console.error (err);
            return Statique.sendRes (res, 500, "html", "Internal server error");
        }

        // convert page object to array
        var pageArray = []
          , pages = SITE_CONFIG.parsed.roots.pages
          , pageHtml = "";
          ;

        // add title
        if (isBlogPost) {
            fileContent = "## " + post.title + "\n\n" + fileContent;
        }

        for (var url in pages) {
            var cPage = JSON.parse(JSON.stringify(pages[url]));
            cPage.url = url;
            pageArray.push (cPage);
        }

        pageArray.sort (function (a, b) {
            return (a.order || 0) > (b.order || 0);
        });

        for (var i = 0; i < pageArray.length; ++i) {
            var cPageObj = pageArray[i];
            if (cPageObj.visible === false) { continue; }
            pageHtml +=
                "<li class='page'>\n"
              + "    <a href='" + cPageObj.url + "'>" + cPageObj.label + "</a>\n"
              + "</li>\n";
        }

        var postHtml = "";
        if (posts) {
            for (var i = 0; i < posts.length; ++i) {
                var cPostObj = posts[i];
                if (cPostObj.visible === false) { continue; }
                postHtml +=
                    "<div class='post'>\n"
                      + "<a href='" + SITE_CONFIG.blog.url + "/" + cPostObj.slug + "'><h1>" + cPostObj.title + "</h1></a>\n"
                      + "<div class='post-content'>\n"
                          + Marked (cPostObj.content) + "\n"
                      + "</div>\n"
                      + "<div class='post-bottom'>\n"
                          + "<span class='date'>" + Moment (cPostObj.publishedAt, "DD-MM-YYYY").format("DD MMM YYYY") + "</span>"
                          + " | <a href='" + SITE_CONFIG.blog.url + "/" + cPostObj.slug + "'>\n"
                              + "Read more »\n"
                          + "</a>\n"
                      + "</div>\n"
                  + "</div>";
            }
        }

        // success response
        Statique.sendRes (res, 200, "text/html",
            SITE_CONFIG.parsed.roots.template.page.replace (
                "{{PAGE_CONTENT}}"
              , Marked (fileContent)
            ).replace(
                "{{TITLE}}"
              , SITE_CONFIG.title
            ).replace(
                "{{PAGES}}"
              , pageHtml
            ).replace(
                "{{BLOG_POSTS}}"
              , postHtml
            )
        );
    });
};

/**
 *  Handle POST requests
 *
 */
module.exports["handlePage:POST"] = function (req, res, pathName, route) {

    // get form data
    getFormData (req, function (err, formData) {

        if (err) {
            console.error (err);
            return res.end ("Internal server error");
        }

        if (Object.keys(FORMS).indexOf(formData.formId) !== -1) {
            return FORMS[formData.formId](req, res, formData);
        }

        return Statique.sendRes (res, 400, "text/html", "Invalid or missing form id");
    });
};

module.exports["handlePage:GET"] = handlePageGet;
