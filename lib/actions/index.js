"use strict"

import { url } from "../client/common/index.js";

export default function (Bloggify) {
    const handler = method => {
        return (action, cb, htmlResponseCb) => {
            Bloggify.server.addPage(url(action), method, async ctx => {
                const shouldJsonResponse = ctx.query.json === "true" || (
                    ctx.req.headers["content-type"] || ""
                ).includes("application/json") || !htmlResponseCb;

                const send = (error, data) => {
                    if (shouldJsonResponse) {
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

                let data = {}
                try {
                    data = await cb(ctx, send)
                } catch (err) {
                    return send(err)
                }

                send(null, data)
            })
        }
    }

    const methods = ["get", "post", "all"]
    const Actions = {}
    methods.forEach(c => {
        Actions[c] = handler(c)
    })
    Actions.url = url

    return Actions
}
