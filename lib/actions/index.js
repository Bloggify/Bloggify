const common = require("./common");

module.exports = Bloggify => {
    const handler = method => {
        return (action, cb, htmlResponseCb) => {
            Bloggify.server.addPage(common.url(action), method, lien => {
                const send = (err, data) => {
                    if (lien.query.json === "true" || (lien.req.headers["content-type"] || "").includes("application/json") || !htmlResponseCb) {
                        if (err) {
                            lien.apiError(err, 400);
                        } else {
                            if (typeof data !== "object") {
                                lien.apiMsg(data);
                            } else {
                                lien.end(data);
                            }
                        }
                    } else if (htmlResponseCb) {
                        htmlResponseCb(lien, err, data);
                    } else {
                        lien.apiError("There is no such action");
                    }
                };

                const p = cb(lien, send);
                if (p && typeof p.then === "function" && typeof p.catch === "function") {
                    p.then(data => {
                        if (data === null) { return; }
                        process.nextTick(() => {
                            send(null, data);
                        });
                    }).catch(err => {
                        send(err);
                    });
                }
            });
        };
    };
    const methods = ["get", "post", "all"];
    const Actions = {};
    methods.forEach(c => {
        Actions[c] = handler(c);
    });
    Actions.url = common.url;
    return Actions;
};
