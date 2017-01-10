"use strict";

const BloggifyPaths = require("../lib");

const Bloggify = { /* The Bloggify instance */ };

// Create a new instance of BloggifyPaths
console.log(new BloggifyPaths("~/path/to/my/app", {
    paths: {
        // Override the default (bloggify.js) with a JSON path.
        config: "bloggify.json"
    }
}, Bloggify));
// BloggifyPaths {
//   root: '/home/.../path/to/my/app',
//   _: {},
//   _paths:
//    { bloggify: '/',
//      config: 'bloggify.json',
//      plugins: '/node_modules',
//      publicMain: '/!/bloggify/public/',
//      publicCore: '/!/bloggify/core/',
//      publicTheme: '/!/bloggify/theme/' },
//   bloggify: '/home/.../path/to/my/app/',
//   config: '/home/.../path/to/my/app/bloggify.json',
//   plugins: '/home/.../path/to/my/app/node_modules',
//   publicMain: '/home/.../path/to/my/app/!/bloggify/public/',
//   publicCore: '/home/.../path/to/my/app/!/bloggify/core/',
//   publicTheme: '/home/.../path/to/my/app/!/bloggify/theme/' }
