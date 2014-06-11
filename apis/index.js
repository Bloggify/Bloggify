// Dependencies
var Marked = require("marked")
  , Moment = require("moment")
  , QueryString = require("querystring")
  , JxUtils = require("jxutils")
  , Url = require("url")
  , Mandrill = require('mandrill-api/mandrill')
  , Validators = require("./validators")
  , Highlight = require("highlight.js")
  , HandleError = require("./errors")
  ;

// Highlight config
Highlight.configure({ classPrefix: '' });
Marked.setOptions({
    highlight: function (code) {
        return Highlight.highlightAuto(code).value;
    }
});

// Server cache for files
var fileCache = {
    dummyPath: {
        ttl: setTimeout (function () {
            delete fileCache["dummyPath"];
        }, Config.gitSite.cache.ttl)
      , content: "Dummy"
    }
};

// Mandrill configuratiou
var MandrillClient = new Mandrill.Mandrill(Config.mandrillConfig.key);

/**
 * validateField
 * This funciton validates the value by
 * providing the validators
 *
 * @name validateField
 * @function
 * @param {Anything} value the value that should be validated
 * @param {String} validators comma separated validators in this format:
 * "valitator1,validator2", e.g.: "string,non-empty"
 * @return {Boolean} if the value is valid, the function will return true. If
 * not, false will be returned
 */
function validateField (value, validators) {
    validators = validators.split(",");
    for (var i = 0; i < validators.length; ++i) {
        if (
            !Validators[validators[i]]
            || Validators[validators[i]](value) === false
        ) {
            return false;
        }
    }
    return true;
}

/**
 * parseCookies
 * This function parses the cookies from request
 *
 * @name parseCookies
 * @function
 * @param {Object} request the request object
 * @return {Object} the parsed cookies into an object
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

// Form handlers and data validators
const FORMS = {
    "contact": {
        handler: function (req, res, formData) {

            // TODO Antispam
            MandrillClient.messages.send({
                message: {
                    from_email: formData.email
                  , from_name: formData.name
                  , to: [
                        {
                            email: Config.contact.email
                          , name: Config.contact.name
                        }
                    ]
                  , subject: formData.subject
                  , text: formData.message
                }
            }, function(result) {
                console.log(result);
                if (result.reject_reason) {
                    return Statique.sendRes(
                        res, 400, "text/html",
                        JSON.stringify({ message: "Sorry, an error ocured. "
                          + "Try again. If the "
                          + "problem persists, open an issue. We log such "
                          + "errors, so hopefully we will fix them."
                        })
                    );
                }

                Statique.sendRes(
                    res, 200, "text/html",
                    JSON.stringify({ message: "Thank you for getting in touch. "
                       + "I will try to reply you as soon as posible."
                    })
                );
            }, function (error) {
                console.error(error);
                return Statique.sendRes(
                    res, 400, "text/html",
                    JSON.stringify({ message: "Sorry, an error ocured. "
                      + "Try again. If the "
                      + "problem persists, open an issue. We log such "
                      + "errors, so hopefully we will fix them."
                    })
                );
            });
        }
      , validate: {
            email: "email"
          , name: "string,non-empty"
          , subject: "string,non-empty"
          , message: "string,non-empty"
        }
    }
  , "login": function (req, res, formData) {

        // get cookies
        var cookies = parseCookies(req);
        if (sessions[cookies.sid]) {
            return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                message: "You are logged in already."
            }));
        }

        // username
        if (!formData.username) {
           return Statique.sendRes(res, 400, "text/html", JSON.stringify({
               message: "Missing username"
           }));
        }

        // password
        if (!formData.password) {
            return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                message: "Missing password"
            }));
        }

        // get user
        var user = SITE_CONFIG.parsed.roots.users[
            formData.username.toLowerCase()
        ];

        if (!user) {
            return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                message: "Invalid username."
            }));
        }

        // validate password
        if (user.password !== formData.password) {
            return Statique.sendRes(res, 403, "text/html", JSON.stringify({
                message: "Invalid password."
            }));
        }

        // valid request
        var sid = "_" + Math.random().toString(36);
        sessions[sid] = {
            id: sid
          , user: user
          , ttl: setTimeout(function () {
                console.log("Removing session with id: " + sid);
                delete sessions[sid];
            }, Config.gitSite.cache.ttl)
        };

        // set session id cookie
        res.setHeader("set-cookie", "sid=" + sid);

        // success response
        Statique.sendRes(res, 200, "text/html", JSON.stringify({
            message: "Successfully logged in"
        }));
    }
  , "reinitCache": function (req, res, formData) {

        // not logged in
        if (!sessions[parseCookies(req).sid]) {
            return Statique.sendRes(res, 403, "text/html", JSON.stringify({
                message: "You should be logged in to reinit the cache."
            }));
        }

        // parse paths
        SITE_CONFIG.parsePaths();
        Statique.sendRes(res, 200, "text/html", JSON.stringify({
            message: "Successfully reinited cache."
        }));
    }
  , "exportAsHtml": function (req, res, formData) {

        // not logged in
        if (!sessions[parseCookies(req).sid]) {
            return Statique.sendRes(res, 403, "text/html", JSON.stringify({
                message: "You should be logged to be able to export this site."
            }));
        }

        // TODO The magic

        Statique.sendRes(res, 200, "text/html", JSON.stringify({
            message: "Successfully reinited cache."
        }));
    }
};

/**
 * readFile
 * This function reads a file from hard disk or from cache
 * deleting it after the ttl timeout expires.
 *
 * @name readFile
 * @function
 * @param {String} path path that will be passed to Statique
 * @param {Function} callback the callback function
 * @return
 */
function readFile (path, callback) {

    // try to get the file from cache
    var fromCache = fileCache[path];
    if (fromCache) {

        // reset timeout
        fromCache.ttl = setTimeout(function () {
            console.log("Removing file from cache: " + path);
            delete fileCache[path]
        }, Config.gitSite.cache.ttl);

        // callback content
        return callback(null, fromCache.content);
    }

    // read file using statique
    Statique.readFile(path, function (err, content) {
        if (err) { return callback(err); }

        fileCache[path] = {
            ttl: setTimeout(function () {
                console.log("Deleting " + path);
                delete fileCache[path];
            }, Config.gitSite.cache.ttl)
          , content: content
        };

        callback(null, content.toString());
    });
}

/**
 * fetchPosts
 * This function returns the posts via callback
 *
 * @name fetchPosts
 * @function
 * @param {Number} skip How many posts should be skipped
 * @param {Number} limit How many posts to return
 * @param {Function} callback The callback function that will be called with an
 * error and the posts array
 * @return {undefined} Returns undefined
 */
function fetchPosts (skip, limit, callback) {

     skip = skip || 0;
     limit = ((limit || posts.length) + skip) - 1;

     var posts = JxUtils.cloneObject(SITE_CONFIG.parsed.roots.posts)
       , result = []
       , complete = skip
       ;

     if (skip >= limit + 1) {
        return callback(null, []);
     }

     for (var i = skip; i <= limit; ++i) {
         (function (cPost) {

            if (!cPost) {
                if (++complete >= limit) {
                    callback(null, result);
                }
                return;
            }

            var pathToPost = SITE_CONFIG.paths.roots.posts + "/" + cPost.path;
            readFile(pathToPost, function (err, postContent) {
                if (err) { return callback(err); }
                cPost.content = postContent;
                result.push(cPost);
                if (++complete >= limit) {
                    callback(null, result);
                }
            });
         })(posts[i]);
     }
}

/**
 * getFormData
 * Gets the form data sent via POST requests
 *
 * @name getFormData
 * @function
 * @param {Object} req The request object
 * @param {Function} callback the callback function
 * @return
 */
function getFormData (req, callback) {

    var formData = ""
      , error = ""
      ;

    req.on("data", function (data) {
        formData += data;
    });

    req.on("error", function (data) {
        error += data;
    });

    req.on("end", function (data) {
        if (error) { return callback(error); }
        callback(null, QueryString.parse(formData));
    });
}

/**
 * handlePageGet
 * This function handles the GET requests.
 *
 * @name handlePageGet
 * @function
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {String} pathName the path name
 * @param {String} route the Statique route
 * @param {Array} the posts (if undefined and @isBlogPost is true the function
 * will be called again with the fetches posts)
 * @param {Boolean} isBlogPost shows if the route is to a blog post
 * @return
 */
function handlePageGet (req, res, pathName, route, posts, isBlogPost) {

    // handle core pages, build the route
    if (route && route.indexOf("/core") !== 0) {
        route = SITE_CONFIG.paths.roots.pages + route;
    }

    if (pathName.indexOf(SITE_CONFIG.blog.url) === 0 && !posts && !isBlogPost) {
        var urlSearch = QueryString.parse(
            (Url.parse(req.url).search || "").substring(1)
        );
        urlSearch.page = Math.floor(Number(urlSearch.page)) - 1;
        fetchPosts(
            urlSearch.page * SITE_CONFIG.blog.posts.limit
          , SITE_CONFIG.blog.posts.limit
          , function (err, data) {
                if (err) {
                    console.error (err);
                    return Statique.sendRes(res, 500, "text/html",
                        JSON.stringify({
                            message: "Internal Server Error"
                        })
                    );
                }

                handlePageGet(req, res, pathName, route, data);
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
            return Statique.sendRes(res, 404, "text/html", "Post not found");
        }
    }

    // read file
    readFile(route, function (err, fileContent) {

        if (err) {
            console.error(err);
            return Statique.sendRes(res, 500, "html", "Internal server error");
        }

        // convert page object to array
        var pageArray = []
          , pages = SITE_CONFIG.parsed.roots.pages
          , pageHtml = "";
          ;

        // add title
        if (isBlogPost) {
            fileContent = "# " + post.title + "\n\n" + fileContent;
        }

        for (var url in pages) {
            var cPage = JxUtils.cloneObject(pages[url]);
            cPage.url = url;
            pageArray.push(cPage);
        }

        pageArray.sort(function (a, b) {
            return (a.order || 0) > (b.order || 0);
        });

        for (var i = 0; i < pageArray.length; ++i) {
            var cPageObj = pageArray[i];
            if (cPageObj.loggedIn && !sessions[parseCookies(req).sid]) {
                cPageObj.visible = false;
            }
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
                          + Marked(cPostObj.content) + "\n"
                      + "</div>\n"
                      + "<div class='post-bottom-shadow'></div>\n"
                      + "<div class='post-bottom'>\n"
                          + "<span class='date'>" + Moment(cPostObj.publishedAt, "DD-MM-YYYY").format("DD MMM YYYY") + "</span>"
                          + " | <a href='" + SITE_CONFIG.blog.url + "/" + cPostObj.slug + "'>\n"
                              + "Read more »\n"
                          + "</a>\n"
                      + "</div>\n"
                  + "</div>";
            }
        }

        // success response
        Statique.sendRes(res, 200, "text/html",
            SITE_CONFIG.parsed.roots.template.page.replace(
                "{{PAGE_CONTENT}}"
              , Marked(fileContent)
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
}

/**
 * handlePagePost
 * This function handles the post requests
 *
 * @name handlePagePost
 * @function
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {String} pathName the pathname
 * @param {Object} route the Statique route
 * @return
 */
function handlePagePost (req, res, pathName, route) {

    // get form data
    getFormData(req, function (err, formData) {

        if (err) {
            console.error (err);
            return res.end ("Internal server error");
        }

        if (Object.keys(FORMS).indexOf(formData.formId) !== -1) {
            var thisForm = FORMS[formData.formId];
            if (typeof thisForm === "function") {
                return thisForm(req, res, formData);
            }

            if (thisForm.constructor.name === "Object") {
                if (
                    thisForm.validate
                    && thisForm.validate.constructor.name === "Object"
                ) {
                    for (var fieldName in thisForm.validate) {
                        if (!validateField(
                            formData[fieldName], thisForm.validate[fieldName])
                           ) {
                            return Statique.sendRes(
                                res, 400, "text/html", JSON.stringify({
                                    message: fieldName[0].toUpperCase()
                                           + fieldName.substring(1)
                                           + " is invalid."
                                })
                            );
                        }
                    }
                }

                thisForm.handler(req, res, formData);
            }

            return;
        }

        return Statique.sendRes(res, 400, "text/html", JSON.stringify({
            message: "Invalid or missing form id"
        }));
    });
}

// public methods
module.exports["handlePage:GET"] = handlePageGet;
module.exports["handlePage:POST"] = handlePagePost;
