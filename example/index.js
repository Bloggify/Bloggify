"use strict";

const bloggifyPaths = require("../lib");

console.log(bloggifyPaths("~/path/to/my/app"));

// BloggifyPaths {
//   root: '/home/user/path/to/my/app',
//   _paths: { bloggify: '.bloggify', config: 'index', plugins: 'plugins' },
//   bloggify: '/home/user/path/to/my/app/.bloggify',
//   config: '/home/user/path/to/my/app/.bloggify/index',
//   plugins: '/home/user/path/to/my/app/.bloggify/plugins' }
