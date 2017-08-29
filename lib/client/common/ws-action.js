const DATA_EVENT = "__data"

module.exports = class WsAction {
    constructor (name, socket) {
        this.name = name
        this.socket = socket
    }
    write (err, data) { this.socket.emit(DATA_EVENT, err, data); }
    data (data) { this.socket.emit(DATA_EVENT, null, data); }
    error (err, data) { this.socket.emit(DATA_EVENT, err, data); }
    on (event, cb) { this.socket.on(event, cb); }
    emit (name, ...data) { this.socket.emit(name, ...data); }
}
