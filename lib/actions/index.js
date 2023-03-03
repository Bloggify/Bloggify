"use strict"

const common = require("../client/common")
    , deffy = require("deffy")

module.exports = Bloggify => {
    const handler = method => {
        return (action, cb, htmlResponseCb) => {
            Bloggify.server.addPage(common.url(action), method, ctx => {
                const send = (error, data) => {
                    if (ctx.query.json === "true" || (ctx.req.headers["content-type"] || "").includes("application/json") || !htmlResponseCb) {
                        if (error) {
                            error.status = error.status || error.statusCode || 500
                            if (error.status < 500) {
                                const res = {
                                    message: error.message,
                                    status: error.status,
                                }

                                if (error.code) {
                                    res.code = error.code
                                }

                                if (error.metadata) {
                                    res.metadata = error.metadata
                                }

                                ctx.end(res, error.status)
                                return
                            }

                            Bloggify.log(error)
                            ctx.end({
                                message: Bloggify.production ? "Internal Server Error" : error.message
                            }, error.status)
                        } else {
                            if (typeof data !== "object") {
                                ctx.apiMsg(data)
                            } else {
                                ctx.end(data)
                            }
                        }
                    } else if (htmlResponseCb) {
                        htmlResponseCb(ctx, error, data)
                    } else {
                        ctx.apiError("There is no such action", 404)
                    }
                }

                const p = cb(ctx, send)
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
