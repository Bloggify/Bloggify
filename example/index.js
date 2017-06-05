// The js views should export a function
module.exports = (ctx, cb) => {
    cb(null, {
        users: [
            "Alice",
            "Bob"
        ]
    });
};
