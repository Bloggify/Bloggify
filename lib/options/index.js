module.exports = {
    loadPlugins: false
  , plugins: []
  , corePlugins: [
        "_plugin-manager",
        "_bloggify-router"
    ]
  , server: {
        errorPages: false
      , public: "public"
      , port: 8080
      , host: null
    }
  , theme: {
        path: "theme"
      , public: "public"
    }
  , adapter: {
        paths: {
            articles: "content/articles"
          , pages: "content/pages"
        }
      , parse: {}
    }
};
