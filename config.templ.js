global.Config = {
    "mandrillConfig": {
        "key": "..."
    }
  , "contact": {
        "email": "..."
      , "name": "..."
    }
  , "gitSite": require (__dirname + "/site")
  , "ipaddress": process.env.OPENSHIFT_NODEJS_IP || "localhost"
  , "port":      process.env.OPENSHIFT_NODEJS_PORT || 8080
  , "root":      __dirname
};

module.exports = Config;
