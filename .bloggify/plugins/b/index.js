exports.init = (conf, bloggify, ready) => {
    console.log("Loaded plugin b", conf);
    setTimeout(function() {
        ready();
    }, 10000);
};
