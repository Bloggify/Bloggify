"use strict";

const BloggifyServer = require("../lib");

let app = new BloggifyServer(`${__dirname}/../node_modules/bloggify-app-example`);
app.onLoad(err => {
    console.log(`Bloggify server running on port ${app._serverPort}`);
});
