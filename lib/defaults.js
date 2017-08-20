module.exports = {
    loadPlugins: false
  , cms_methods: true
  , plugins: []
  , pluginConfigs: {}
  , metadata: {
        title: ""
      , description: ""
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

      , publicMain: "/@/bloggify/public/"
      , publicCore: "/@/bloggify/core/"
      , publicTheme: "/@/bloggify/theme/"
      , cssUrls: "/@/bloggify/css-urls/"

        // Server related files
      , errors: "/app/errors"
      , controllers: "/app/controllers"
      , routes: "/app/routes"
      , apis: "/app/apis"
      , views: "/app/views"
      , actions: "/app/actions"
    }
  , bundler: {
        aliases: {
            "bloggify": `${__dirname}/client/index.js`
          , "bloggify/actions": `${__dirname}/client/actions.js`
          , "bloggify/http-actions": `${__dirname}/client/http-actions.js`
          , "bloggify/ws-actions": `${__dirname}/client/ws-actions.js`
        }
    }
};
