const config = require("./config")

module.exports = {
    url (name) {
        return `${config.host}${config.url}/${name}`
    }
  , wsUrl (name) {
        return `${config.host}${config.url}/${name}`
    }
}
