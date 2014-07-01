module.exports = {
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
  , "login": function (req, res, formData) {

        // get cookies
        var cookies = parseCookies(req);
        if (sessions[cookies.sid]) {
            return Statique.sendRes(res, 400, "text", JSON.stringify({
                message: "You are logged in already."
            }));
        }

        // username
        if (!formData.username) {
           return Statique.sendRes(res, 400, "text", JSON.stringify({
               message: "Missing username"
           }));
        }

        // password
        if (!formData.password) {
            return Statique.sendRes(res, 400, "text", JSON.stringify({
                message: "Missing password"
            }));
        }

        // get user
        var user = Config.user;

        if (user.name !== formData.username) {
            return Statique.sendRes(res, 400, "text", JSON.stringify({
                message: "Invalid username."
            }));
        }

        // validate password
        if ((user.pass || user.password) !== formData.password) {
            return Statique.sendRes(res, 403, "text", JSON.stringify({
                message: "Invalid password."
            }));
        }

        // valid request
        var sid = "_" + Math.random().toString(36);
        sessions[sid] = {
            id: sid
          , user: user
          , ttl: setTimeout(function () {
                Debug.log("Removing session from cache: " + sid, "info");
                delete sessions[sid]
            }, Config.site.session.ttl)
        };

        // set session id cookie
        res.setHeader("set-cookie", "sid=" + sid);

        // success response
        Statique.sendRes(res, 200, "text", JSON.stringify({
            message: "Successfully logged in"
        }));
    }
  , "reinitCache": function (req, res, formData) {

        // not logged in
        if (!sessions[parseCookies(req).sid]) {
            return Statique.sendRes(res, 403, "text", JSON.stringify({
                message: "You should be logged in to reinit the cache."
            }));
        }

        // parse paths
        Bloggify.clearCache();
        Statique.sendRes(res, 200, "text", JSON.stringify({
            message: "Successfully reinited cache."
        }));
    }
  , "exportAsHtml": function (req, res, formData) {

        // not logged in
        if (!sessions[parseCookies(req).sid]) {
            return Statique.sendRes(res, 403, "text", JSON.stringify({
                message: "You should be logged to be able to export this site."
            }));
        }

        // TODO The magic

        Statique.sendRes(res, 200, "text", JSON.stringify({
            message: "Successfully reinited cache."
        }));
    }
  , "new-post": {
        handler: function (req, res, formData) {

            // not logged in
            if (!sessions[parseCookies(req).sid]) {
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
        }
      , validate: {
            title: "string,non-empty"
          , content: "string,non-empty"
        }
    }
  , "edit-post": {
        handler: function (req, res, formData) {

            // not logged in
            if (!sessions[parseCookies(req).sid]) {
                return Statique.sendRes(res, 403, "text", JSON.stringify({
                    message: "Sign in to post something here."
                }));
            }

            var postId = parseInt(formData.postId);
            var editedPost = {
                title: formData.title
              , slug: Utils.slug(formData.title)
              , content: formData.content
            };

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
        }
      , validate: {
            title: "string,non-empty"
          , content: "string,non-empty"
        }
    }
};
