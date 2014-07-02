var Form = module.exports = {
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
                Debug.log(result, "info");
                if (result.reject_reason) {
                    return Statique.sendRes(
                        res, 400, "text",
                        JSON.stringify({ message: "Sorry, an error ocured. "
                          + "Try again. If the "
                          + "problem persists, open an issue. We log such "
                          + "errors, so hopefully we will fix them."
                        })
                    );
                }

                Statique.sendRes(
                    res, 200, "text",
                    JSON.stringify({ message: "Thank you for getting in touch. "
                       + "I will try to reply you as soon as posible."
                    })
                );
            }, function (error) {
                Debug.log(error, "error");
                return Statique.sendRes(
                    res, 400, "text",
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
  , "logout": function (req, res, formData) {
        Bloggify.session.end(req, function (err, data) {
            if (err) {
                Debug.log(err, "error");
                return Statique.error(500);
            }
            Statique.redirect(res, "/");
        });
    }
  , "login": function (req, res, formData) {

        Bloggify.session.isLoggedIn(req, function (err, sessionData) {

            if (err) {
                Debug.log(err, "error");
                return Statique.error(500);
            }

            // Logged in already
            if (sessionData !== false) {
                return Statique.sendRes(res, 400, "text", JSON.stringify({
                    message: "You are logged in already."
                }));
            }

            // get user
            var user = Config.user;
            if (user.name !== formData.username
                || user.password !== formData.password
            ) {
                return Statique.sendRes(res, 403, "text", JSON.stringify({
                    message: "Wrong credentials."
                }));
            }

            // valid request
            Bloggify.sessions.create({
                user: user
            }, function (err, data) {
                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(500);
                }

                // set session id cookie
                res.setHeader("set-cookie", "sid=" + sid);

                // success response
                Statique.sendRes(res, 200, "text", JSON.stringify({
                    message: "Successfully logged in"
                }));
            });
        });
    }
  , "reinitCache": function (req, res, formData) {

        Bloggify.session.isLoggedIn(req, function (err, sessionData) {

            if (err) {
                Debug.log(err, "error");
                return Statique.error(500);
            }

            if (!sessionData) {
                return Statique.sendRes(res, 403, "text", JSON.stringify({
                    message: "You should be logged in to reinit the cache."
                }));
            }

            // parse paths
            Bloggify.clearCache();
            Statique.sendRes(res, 200, "text", JSON.stringify({
                message: "Successfully reinited cache."
            }));
        });
    }
  , "new-post": {
        handler: function (req, res, formData) {

            Bloggify.session.isLoggedIn(req, function (err, sessionData) {

                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(500);
                }

                if (!sessionData) {
                    return Statique.sendRes(res, 403, "text", JSON.stringify({
                        message: "Sign in to post something here."
                    }));
                }

                var newPost = {
                    title: formData.title
                  , slug: Utils.slug(formData.title)
                  , publishedAt: new Moment().format("DD-MM-YYYY")
                  , by: Config.user.nickname
                  , id: Config.site.parsed.roots.posts.length + 1
                  , content: formData.content
                };

                // Emit "new-post" event
                Bloggify.emitter.emit("new-post", {
                    newPost: newPost
                  , formData: formData
                  , req: req
                  , res: res
                });

                // Publish post
                Bloggify.post.publish(newPost, function (err, data) {
                    if (err) {
                        return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                            message: err
                        }));
                    }
                    Statique.sendRes(res, 200, "text/html", JSON.stringify({
                        message: "Post published"
                    }));
                });
            });
        }
      , validate: {
            title: "string,non-empty"
          , content: "string,non-empty"
        }
    }
  , "edit-post": {
        handler: function (req, res, formData) {
            Bloggify.session.isLoggedIn(req, function (err, sessionData) {

                if (err) {
                    Debug.log(err, "error");
                    return Statique.error(500);
                }

                if (!sessionData) {
                    return Statique.sendRes(res, 403, "text", JSON.stringify({
                        message: "Sign in to post something here."
                    }));
                }

                var postId = parseInt(formData.postId)
                  , editedPost = {
                        title: formData.title
                      , slug: Utils.slug(formData.title)
                      , content: formData.content
                    }
                  ;

                Bloggify.post.edit({id: postId}, editedPost, function (err, data) {
                    if (err) {
                        return Statique.sendRes(res, 400, "text/html", JSON.stringify({
                            message: err
                        }));
                    }
                    Statique.sendRes(res, 200, "text/html", JSON.stringify({
                        message: "Post published"
                    }));
                });
            });
        }
      , validate: {
            title: "string,non-empty"
          , content: "string,non-empty"
        }
    }
};
