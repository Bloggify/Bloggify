module.exports = {
    loadPlugins: false
  , cms_methods: true
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
  , pluginConfigs: {
        "bloggify-plugin-manager": {
            plugins: []
        }
    }
  , server: {
        errorPages: false
      , public: "public"
      , port: process.env.PORT || 8080
      , host: null
      , csrf: true
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
  , paths:  {
        // The bloggify directory (by default the root)
        bloggify: "/"

        // The config file: `bloggify.js`
      , config: "/bloggify.js"

        // Where to store the plugins
      , plugins: "/node_modules"

      , publicMain: "/!/bloggify/public/"
      , publicCore: "/!/bloggify/core/"
      , publicTheme: "/!/bloggify/theme/"
      , cssUrls: "/!/bloggify/css-urls/"
    }
  , bundler: {
        aliases: {
            "bloggify": `${__dirname}/client/index.js`
        }
    }
};
