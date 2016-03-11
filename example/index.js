"use strict";

const BloggifyCore = require("../lib");


let bloggify = new BloggifyCore(`${__dirname}/../node_modules/bloggify-app-example`, {
    config: {
        foo: "bar"
    }
});

bloggify.getConfig((err, data) => {
    console.log(err || data);
});

bloggify.loadPlugins(["b", "a"], (err, data) => {
    console.log(err || data);
});
