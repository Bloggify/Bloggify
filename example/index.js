"use strict";

const Bloggify = require("../lib");

let app = new Bloggify(`${__dirname}/../node_modules/bloggify-app`);

app.onLoad(err => {
    console.log(`Bloggify server running on port ${app._serverPort}`);
});
