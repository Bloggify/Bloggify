"use strict";

import { url } from "../client/common/index.js";

/** 
 * Bloggify Actions
 * Initialize the Bloggify Actions system, which allows you to easily create API endpoints in your Bloggify app.
 * @param {Bloggify} Bloggify The Bloggify instance.
 * @returns {object} An object with methods to create API endpoints (get, post, all) and a url helper function.
 */
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
                            error.status = error.status || error.statusCode || 500;
                            if (error.status < 500) {
                                const res = {
                                    message: error.message,
                                    status: error.status,
                                };

                                if (error.code) {
                                    res.code = error.code;
                                }

                                if (error.metadata) {
                                    res.metadata = error.metadata;
                                }

                                ctx.end(res, error.status);
                                return;
                            }

                            Bloggify.log(error);
                            ctx.end({
                                message: Bloggify.production ? "Internal Server Error" : error.message
                            }, error.status);
                        } else {
                            if (typeof data !== "object") {
                                ctx.apiMsg(data);
                            } else {
                                ctx.end(data);
                            }
                        }
                    } else if (htmlResponseCb) {
                        htmlResponseCb(ctx, error, data);
                    } else {
                        ctx.apiError("There is no such action", 404);
                    }
                };

                let data = {};
                try {
                    data = await cb(ctx, send);
                    if (data === null) { return; }
                } catch (err) {
                    return send(err);
                }

                send(null, data);
            });
        };
    };

    const methods = ["get", "post", "all"];
    const Actions = {};
    methods.forEach(c => {
        Actions[c] = handler(c);
    });
    Actions.url = url;

    return Actions;
}
