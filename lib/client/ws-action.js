"use strict"

const common = require("./common")
    , WsAction = require("./common/ws-action")
    , SocketIO = require("socket.io-client")


let CSRF_TOKEN = null

module.exports = {
    ws (name, handler) {
        const socket = SocketIO.connect(common.wsUrl(name))
        const action = new WsAction(name, socket)
        if (handler) {
            const send = (err, data) => {
                socket.emit("__data", err, data)
            }
            socket.on("error", err => {
                handler(err, null, socket, send)
            })
            socket.on("__data", (err, data) => {
                handler(err, data, socket, send)
            })
        }
        return action
    }
}

module.exports.ws._ = {}
