module.exports = (conf, bloggify, ready) => {
    bloggify.server.addPage("/", lien => {
        lien.end({
            hello: "world"
        })
    });
    console.log("Loaded plugin a", conf);
    setTimeout(() => {
        ready();
    }, 10);
};
