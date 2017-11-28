"use strict"

const DATA_EVENT = "__data"

module.exports = class WsAction {
    constructor (name, socket) {
        this.name = name
        this.socket = socket
    }
    write (err, data) { this.socket.emit(DATA_EVENT, err, data); return this; }
    data (data) { this.socket.emit(DATA_EVENT, null, data); return this; }
    error (err, data) { this.socket.emit(DATA_EVENT, err, data); return this; }
    on (event, cb) { this.socket.on(event, cb); return this; }
    emit (name, ...data) { this.socket.emit(name, ...data); return this; }
    heartbeat () { this.socket.emit("heartbeat"); return this; }
}
