const common = require("./common")
    , SocketIO = require("socket.io")
    , deffy = require("deffy")
    , WsAction = require("./ws-action")
    ;

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

    Actions.ws = (name, middlewares, handler) => {
        if (typeof middlewares === "function") {
            handler = middlewares;
            middlewares = [];
        }
        middlewares = deffy(middlewares, []);
        let thisWsAction = Actions.ws._[name];
        if (thisWsAction && (middlewares.length || handler)) {
            throw new Error("There is already a WS action with this name.");
        }

        const url = common.wsUrl(name);
        const ws = Actions.ws.server.of(url);
        middlewares.forEach(c => { ws.use(c); });
        if (handler) {
            ws.on("connect", socket => {
                socket.on("__data", (err, data) => {
                    handler(err, data, socket, (err, data) => {
                        socket.emit("__data", err, data);
                    });
                });
            });
        }

        thisWsAction = Actions.ws._[name] = new WsAction(name, ws);

        return thisWsAction;
    };

    Actions.ws._ = {};
    Bloggify.wsServer = Actions.ws.server = SocketIO(Bloggify.server.server);
    return Actions;
};