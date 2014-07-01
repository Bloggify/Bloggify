// Highlight config
Highlight.configure({ classPrefix: '' });
Marked.setOptions({
    highlight: function (code) {
        return Highlight.highlightAuto(code).value;
    }
});

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
 * getPost
 * Searches the post in the parsed resources and returns it
 *
 * @name getPost
 * @function
 * @param {Object|String} req The request object or the slug
 * @param {String|undefined} fileContent The file content that is passed to
 * handlePost function
 * @return {Object} The post object that comes from the parsed resources
 */
var getPost = Bloggify.post.fetch;

/**
 * handlePost
 * Attaches the additional fields that are used in the system.
 *
 * @name handlePost
 * @function
 * @param {Object} req The request object
 * @param {Object} cPost The post object from parsed resources
 * @param {String|undefined} postContent If it's a string, the content field
 * will be attached to the post object, being parsed by Marked module.
 * @return {Object} The post object that contains content, date and url fields
 * in addition to the other fields
 */
var handlePost = Bloggify.post.handle;

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

/**
 * fetchPosts
 * This function returns the posts via callback
 *
 * @name fetchPosts
 * @function
 * @param {Object} req The request object
 * @param {Number} skip How many posts should be skipped
 * @param {Number} limit How many posts to return
 * @param {Function} callback The callback function that will be called with an
 * error and the posts array
 * @return {undefined} Returns undefined
 */
function fetchPosts (req, skip, limit, callback) {

     var from = skip
       , to   = skip + limit - 1
       ;

     var posts = Utils.clone(Config.site.parsed.roots.posts)
       , result = []
       , complete = skip - 1
       ;

    if (to >= posts.length) {
        to = posts.length - 1;
    }

    if (from > to) {
        return callback(null, []);
    }

     for (var i = from, k = 0; i <= to; ++i, ++k) {
         (function (cPost, k) {

            if (!cPost) {
                if (++complete >= limit) {
                    callback(null, result);
                }
                return;
            }

            var pathToPost =
                Config.site.paths.roots.posts + "/" + cPost.path
            ;

            Bloggify.file.read(pathToPost, function (err, postContent) {
                if (err) { return callback(err); }
                result[k] = handlePost(req, cPost, postContent);
                if (++complete >= to) {
                    callback(null, result);
                }
            });
         })(posts[i], k);
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
 * @param {Boolean} isBlogPpage it's true if the page is a blog one
 * @return
 */
function handlePageGet (req, res, pathName, route, posts, isBlogPost, isBlogPage) {

    var pageRoute = route.url
      , pages = Utils.clone(Config.site.parsed.roots.pages)
      , currentPage = pages[pathName.slice(0, -1)] || pages[pathName]
      ;

    if (currentPage && currentPage.loggedIn && !sessions[parseCookies(req).sid]) {
        return Statique.error(req, res, 403);
    }

    // handle core pages, build the route
    if (pageRoute && pageRoute.indexOf(Config.site.paths.template + "/core") !== 0) {
        pageRoute = Config.site.paths.roots.pages + pageRoute;
    }

    if (isBlogPage) {
        var pageNumber = parseInt((pathName.match(/[1-9]([0-9]*)/) || [])[0]);

        if (isNaN(pageNumber)) {
            pageNumber = 1;
        }
    }

    if (isBlogPage && !posts && !isBlogPost) {

        fetchPosts(
            req
          , (pageNumber - 1) * Config.site.blog.posts.limit
          , Config.site.blog.posts.limit
          , function (err, data) {

                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(req, res, 500);
                }

                // no posts found
                if (!data || !data.length) {
                    return Statique.error(req, res, 404);
                }

                handlePageGet(req, res, pathName, route, data, isBlogPost, isBlogPage);
            }
        )
        return;
    }

    // handle blog posts
    if (isBlogPost) {

        var postName = pathName.split("/")[2]
          , post = getPost(req, null, null, null, true)
          ;

        if (!post || !postName) {
            return Statique.error(req, res, 404);
        }

        pageRoute = Config.site.paths.roots.posts + "/" + post.path;

        if (req.url !== post.url) {
            return Statique.redirect(res, post.url);
        }
    }

    if (isBlogPage) {
        pageRoute = pages[
            Config.site.blog.url
        ].url;
    }

    // read file
    Bloggify.file.read(pageRoute, function (err, fileContent) {

        if (err) {
            Debug.log(err, "error");
            return Statique.error(req, res, 404);
        }

        // convert page object to array
        var pageArray = []
          , pageHtml = ""
          ;

        if (currentPage && currentPage.wrap === false) {
            return Statique.sendRes(res, 200, "text/html",
                Utils.mRender(fileContent, {
                    config: Config
                })
            );
        }

        if (isBlogPage) {
            currentPage = pages[
                Config.site.blog.url
            ];
        }

        for (var url in pages) {
            var cPage = Utils.clone(pages[url]);
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
            if (!cPageObj.label || cPageObj.visible === false) { continue; }
            cPageObj.additionalClasses = "";
            if ("/" + cPageObj.slug + "/" === pathName
                || cPageObj.url + "/" === pathName
                || cPageObj.url === pathName) {
                cPageObj.additionalClasses = " current-page";
            }

            pageHtml += Utils.mRender(
                Config.site.parsed.roots.template.blocks.page, cPageObj
            );
        }

        var postHtml = "";
        if (posts) {
            for (var i = 0; i < posts.length; ++i) {
                var cPostObj = posts[i];
                if (cPostObj.visible === false) { continue; }
                postHtml += Utils.mRender(
                    Config.site.parsed.roots.template.blocks.post, cPostObj
                );
            }
        }

        var htmlTemplate = Config.site.parsed.roots.template.single.page
          , tPost = null
          ;

        // add title
        if (isBlogPost) {
            htmlTemplate = Config.site.parsed.roots.template.single.post
            tPost = getPost(req, null, fileContent)

            tPost.content += Utils.mRender(
                Marked(
                    Config.site.parsed.roots.template.blocks.postEnd
                )
              , tPost
            );

            // success response
            return Statique.sendRes(res, 200, "text/html",
                Utils.mRender(htmlTemplate, {
                    data: {
                        post: tPost
                      , title: tPost.title
                    }
                  , config: Config
                })
            );
        }

        var data = {
            data: {
                pages: pageHtml
              , title: currentPage.label
              , page: {
                    content: Marked(fileContent)
                  , number: Math.ceil(
                        Config.site.parsed.roots.posts.length
                        / Config.site.blog.posts.limit
                    )
                  , next: pageNumber + 1
                  , active: pageNumber
                  , previous: pageNumber - 1
                }
              , posts: postHtml
            }
          , config: Config
        };

        var page = data.data.page;

        if (page.next > page.number) {
            delete page.next;
        }

        if (page.previous <= 0) {
            delete page.previous;
        }

        // Success response
        Statique.sendRes(res, 200, "text/html",
            Utils.mRender(htmlTemplate, data, { repeat: 2 })
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
            Debug.log(err, "error");
            return res.end ("Internal server error");
        }

        if (Object.keys(Bloggify.form).indexOf(formData.formId) !== -1) {
            var thisForm = Bloggify.form[formData.formId];
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
                                res, 400, "text", JSON.stringify({
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

        return Statique.sendRes(res, 400, "text", JSON.stringify({
            message: "Invalid or missing form id"
        }));
    });
}

// public methods
module.exports["handlePage:GET"] = handlePageGet;
module.exports["handlePage:POST"] = handlePagePost;
