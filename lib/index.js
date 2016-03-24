const bloggifyPaths = require("bloggify-paths");

module.exports = class Bloggify {
    constructor (root, options) {
        this.paths = bloggifyPaths(root, options);
    }
};
