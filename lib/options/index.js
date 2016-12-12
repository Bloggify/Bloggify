module.exports = {
    loadPlugins: false
  , plugins: []
  , pluginConfigs: {}
  , metadata: {
        siteTitle: "No name"
      , description: "Foo"
    }
  , corePlugins: [
        "bloggify-router"
      , "bloggify-plugin-manager"
    ]
  , server: {
        errorPages: false
      , public: "public"
      , port: process.env.PORT || 8080
      , host: null
    }
  , theme: {
        path: "theme"
      , viewsPath: "views"
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
