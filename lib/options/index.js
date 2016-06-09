module.exports = {
    config: require("./config")
  , loadPlugins: false
  , corePlugins: [
        "_plugin-manager",
        "_bloggify-router"
    ]
  , server: {
        errorPages: false
    }
};
