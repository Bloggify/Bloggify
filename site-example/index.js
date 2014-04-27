SITE_CONFIG = {
    title: "Ionică Bizău"
  , url: "http://ionicabizau.net"
  , cache: {
        initOnStart: true
      , ttl: 60 * 1000
    }
  , roots: {
        _pages: "/pages"
      , _posts: "/posts"
      , _users: "/users"
    }
};

for (var root in SITE_CONFIG.roots) {
    SITE_CONFIG.roots[root.substring(1)] = require (__dirname + SITE_CONFIG.roots[root]);
}

module.exports = SITE_CONFIG;
