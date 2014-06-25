var r = require("ractive");
var html = '<!DOCTYPE html>'
+ '\n<html lang="en">'
+ '\n<head>'
+ '\n    <meta charset="UTF-8">'
+ '\n    <title>{{title}}</title>'
+ '\n</head>'
+ '\n<body>'
+ '\n{{hello}} World!'
+ '\n</body>'
+ '\n</html>'

console.log(
    new r({
        template: new r({
                template: html
              , data: {
                    hello: "Hello"
                }
              , preserveWhitespace: true
            }).toHTML(),
        data: {
            title: "hi"
        }
      , preserveWhitespace: true
    }).toHTML()
);
