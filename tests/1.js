requireNoCache = function (path) {
    return eval(require("fs").readFileSync("./2.js").toString())
}

console.log(requireNoCache("./2"));
setTimeout(function () {
    a = requireNoCache ("./2");
    console.log(a);
}, 4000);
