var h = require("handlebars");
var html = '<!DOCTYPE html>'
+ '\n<html lang="en">'
+ '\n<head>'
+ '\n    <meta charset="UTF-8">'
+ '\n    <title>{{title}}</title>'
+ '\n</head>'
+ '\n<body>'
+ '\n{{round (multiply 2)}} World!'
+ '\n</body>'
+ '\n</html>'

console.log(
    h.compile(html)({hello: 2, title: "hi"})
)
