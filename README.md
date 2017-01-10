
# bloggify-core

 [![Patreon](https://img.shields.io/badge/Support%20me%20on-Patreon-%23e6461a.svg)][patreon] [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/bloggify-core.svg)](https://www.npmjs.com/package/bloggify-core) [![Downloads](https://img.shields.io/npm/dt/bloggify-core.svg)](https://www.npmjs.com/package/bloggify-core) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> The Bloggify core library.

## :cloud: Installation

```sh
$ npm i --save bloggify-core
```


## :clipboard: Example



```js
const BloggifyCore = require("bloggify-core");


let bloggify = new BloggifyCore(`${__dirname}/../node_modules/bloggify-app-example`, {
    config: {
        foo: "bar"
    }
});

bloggify.getConfig((err, data) => {
    console.log(err || data);
});

bloggify.loadPlugins(["b"], (err, data) => {
    console.log(err || data);
});

console.log(bloggify.config);
```

## :memo: Documentation


### `BloggifyCore(root, options)`
Creates a new instance of `BloggifyCore`.

#### Params
- **String** `root`: The path to the application's root.
- **Object** `options`: The Blogiffy options.

#### Return
- **Object** The BloggifyCore instance.

### `getConfig(cb)`
Fetches the configuration of the Bloggify instance. If the callback function is not provided, the config object will be returned.

#### Params
- **Function** `cb`: The callback function.

#### Return
- **Object** The configuration.

### `loadPlugins(names, cb)`
Loads the provided plugins.

#### Params
- **Array** `names`: The list of plugin names.
- **Function** `cb`: The callback function.

### `require(name, mod)`
Considering the value of the module (`true`, `false`), it returns the raw module of the plugin or the instance of it.

#### Params
- **String** `name`: The plugin's name.
- **Boolean** `mod`: The plugin's module.

#### Return
- **BloggifyPlugin** The plugin's instance.

### `logLevel(newLogLevel)`
Sets or gets the log level.

The log levels are:

  - `0`: Ignore everything
  - `1`: Errors
  - `2`: Errors + Warnings
  - `3`: Errors + Warnings + Info
  - `4`: Everything

#### Params
- **String** `newLogLevel`: The instance of the log.

#### Return
- **String** The log level.

### `log(msg, type, stream, newLine)`
Prints a log message in the output.

#### Params
- **Error|String** `msg`: The log message.
- **String** `type`: The log type (error|info|warn|log).
- **Stream** `stream`: The output stream (defaults to `process.stderr` for errors and `process.stdout` for other logs).
- **Boolean** `newLine`: A flag wheter to add a new line at the end of the message or not.



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :moneybag: Donations

Another way to support the development of my open-source modules is
to [set up a recurring donation, via Patreon][patreon]. :rocket:

[PayPal donations][paypal-donations] are appreciated too! Each dollar helps.

Thanks! :heart:


## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[patreon]: https://www.patreon.com/ionicabizau
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2016#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
