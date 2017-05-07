const config = require("./config");

module.exports = {
    url (name) {
        return `${config.url}/${name}`;
    }
  , wsUrl (name) {
        return `${config.url}/${name}`;
    }
};
