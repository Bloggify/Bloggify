module.exports = {
    config: require("./config")
  , loadPlugins: false
  , corePlugins: [
        "_plugin-manager",
        "_bloggify-router"
    ]
  , server: {
        errorPages: false
      , public: "public"
    }
  , theme: {
        ext: "ejs"
      , path: "theme"
    }
  , adapter: {
        paths: {
            articles: "content/articles"
          , pages: "content/pages"
        }
      , parse: {}
    }
};
