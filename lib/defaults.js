module.exports = {
    plugins: []
  , title: ""
  , db_uri: process.env.DB_URI
  , db_options: {}
  , description: ""
  , server: {
        errorPages: false
      , public: "public"
      , port: process.env.PORT || 8080
      , host: null
      , csrf: true
      , session: true
    }
  , paths:  {
        // The bloggify directory (by default the root)
        bloggify: "/"

      , publicMain: "/@/bloggify/public/"
      , publicCore: "/@/bloggify/core/"
      , publicTheme: "/@/bloggify/theme/"
      , cssUrls: "/@/bloggify/css-urls/"

        // Server related files
      , errors: "/app/errors"
      , models: "/app/models"
      , controllers: "/app/controllers"
      , routes: "/app/routes"
      , apis: "/app/apis"
      , views: "/app/views"
      , actions: "/app/actions"
      , plugins: "/node_modules"

        // The config file: `bloggify.js`
      , config: "/bloggify.js"
      , package: "package.json"
    }
  , bundler: {
        aliases: {
            "bloggify": `${__dirname}/client/index.js`
          , "bloggify/actions": `${__dirname}/client/actions.js`
          , "bloggify/http-actions": `${__dirname}/client/http-actions.js`
          , "bloggify/ws-actions": `${__dirname}/client/ws-actions.js`
        }
    }
  , actions: true
  , renderers: {
        ajs: {}
    }
}

module.exports.domain = `http://localhost:${module.exports.server.port}`
