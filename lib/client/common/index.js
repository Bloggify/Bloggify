"use strict"

const config = require("./config")
    , qs = require("querystring")

module.exports = {
    url (name, opts) {
        return `${config.host}${config.url}/${name}${opts && opts.query ? "?" + qs.stringify(opts.query) : ""}`
    }
  , wsUrl (name) {
        return `${config.host}${config.ws_url}/${name}`
    }
}
