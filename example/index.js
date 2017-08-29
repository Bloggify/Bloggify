"use strict";

// This is how to include Bloggify as library.
const Bloggify = require("../lib")

// Start the Bloggify app
const app = new Bloggify("path/to/the/application/root")

// Do something after it's started
app.onLoad(err => {
    console.log(`Bloggify server running on port ${app._serverPort}`)
})
