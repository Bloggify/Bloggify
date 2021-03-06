"use strict"

const common = require("../client/common")
    , deffy = require("deffy")

module.exports = Bloggify => {
    const handler = method => {
        return (action, cb, htmlResponseCb) => {
            Bloggify.server.addPage(common.url(action), method, lien => {
                const send = (error, data) => {
                    if (lien.query.json === "true" || (lien.req.headers["content-type"] || "").includes("application/json") || !htmlResponseCb) {
                        if (error) {
                            error.status = error.status || 500
                            if (error.status === 500) {
                                Bloggify.log(error)
                                if (Bloggify.production) {
                                    error.message = "Internal Server Error"
                                }
                            }
                            lien.apiError(error, error.status)
                        } else {
                            if (typeof data !== "object") {
                                lien.apiMsg(data)
                            } else {
                                lien.end(data)
                            }
                        }
                    } else if (htmlResponseCb) {
                        htmlResponseCb(lien, error, data)
                    } else {
                        lien.apiError("There is no such action", 404)
                    }
                }

                const p = cb(lien, send)
                if (p && typeof p.then === "function" && typeof p.catch === "function") {
                    p.then(data => {
                        if (data === null) { return; }
                        process.nextTick(() => {
                            send(null, data)
                        })
                    }).catch(err => {
                        send(err)
                    })
                }
            })
        }
    }
    const methods = ["get", "post", "all"]
    const Actions = {}
    methods.forEach(c => {
        Actions[c] = handler(c)
    })
    Actions.url = common.url

    return Actions
}
