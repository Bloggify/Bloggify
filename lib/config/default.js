// Default Bloggify config
module.exports = {
    site: {
        title: "No Title"
      , description: "Another awesome Bloggify website"
      , git: ""
    }
  , options: {
        customCSS: []
      , customJS: []
    }
  , blog: {
        path: "/blog"
      , slug: "blog"
      , title: "Blog"
      , order: 11
      , articles: {
            limit: 3
        }
    }
  , cache: {
      initOnStart: true,
      ttl: 86400000
    }
  , session: {
      ttl: 864000000
    }
  , user: {
        login: "admin"
      , password: "admin"
      , name: "Admin"
    }
  , content: "/content"
  , theme: "/theme"
  , themeData: {

    }
  , pages: "/pages"
  , articles: "/articles"
  , plugins: []
  , database: {
        uri: "mongodb://localhost:27017/bloggify"
    }
  , port: 8080
  , host: "localhost"
  , fileCache: 1000 * 60 * 60 * 60 * 24 * 7 * 4
};
