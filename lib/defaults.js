"use strict"

module.exports = {
    plugins: []
  , core_plugins: []
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

      , public_main: "/@/bloggify/public/"
      , public_assets: "/@/bloggify/assets/"
      , css_assets: "/@/bloggify/css-assets/"

        // Server related files
      , errors: "/app/errors"
      , models: "/app/models"
      , controllers: "/app/controllers"
      , routes: "/app/routes"
      , services: "/app/services"
      , views: "/app/views"
      , actions: "/app/actions"
      , plugins: "/node_modules"

      // The config file: `bloggify.js(on)`
      , config: "/bloggify"
      , package: "package.json"
    }
  , bundler: {
        aliases: {
            "bloggify": `${__dirname}/client/index.js`
          , "bloggify/actions": `${__dirname}/client/actions.js`
          , "bloggify/actions/common": `${__dirname}/client/common`
        }
    }
  , actions: true
  , renderer: "bloggify-template-renderer"
  , renderers: {
        ajs: {}
    }
}

module.exports.domain = `http://localhost:${module.exports.server.port}`
