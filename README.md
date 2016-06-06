
# bloggify-ejs-renderer

 [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/bloggify-ejs-renderer.svg)](https://www.npmjs.com/package/bloggify-ejs-renderer) [![Downloads](https://img.shields.io/npm/dt/bloggify-ejs-renderer.svg)](https://www.npmjs.com/package/bloggify-ejs-renderer) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> Ejs renderer for Bloggify.

## :cloud: Installation

```sh
$ npm i --save bloggify-ejs-renderer
```


## :clipboard: Example



```js
const bloggifyEjsRenderer = require("bloggify-ejs-renderer");

console.log(bloggifyEjsRenderer());
```

## :memo: Documentation


### `init(config, bloggify)`

#### Params
- **Object** `config`: The configuration object:
 - `disableCache` (Boolean): If `true`, the cache will be disabled.
- **Bloggify** `bloggify`: The `Bloggify` instance.

### `factory(cb)`
Returns a HTTP request handler.

#### Params
- **Function** `cb`: The callback function.

#### Return
- **Function** The request handler.

### `render(lien, path, data, cb)`
Renders the file.

#### Params
- **Lien** `lien`: The `Lien` instance.
- **String** `path`: The file path.
- **Object** `data`: The template data.
- **Function** `cb`: The callback function.



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2016#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
