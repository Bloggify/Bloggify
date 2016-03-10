"use strict";

const BloggifyCore = require("../lib");


let bloggify = new BloggifyCore("~/path/to/app");

bloggify.getConfig((err, data) => {
    console.log(err || data);
    // { plugins: [] }
});
