module.exports["/api/test/"] = function (req, res) {
    res.end(JSON.stringify({"Hello World": "From Ionică Bizău"}, null, 4));
};
