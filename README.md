
# `$ bloggify`

 [![Version](https://img.shields.io/npm/v/bloggify.svg)](https://www.npmjs.com/package/bloggify) [![Downloads](https://img.shields.io/npm/dt/bloggify.svg)](https://www.npmjs.com/package/bloggify)

> We make publishing easy.

## :cloud: Installation

You can install the package globally and use it as command line tool:


```sh
$ npm i -g bloggify
```


Then, run `bloggify --help` and see what the CLI tool can do.


```
$ bloggify --help
Usage: bloggify <command> [options]

We make publishing easy.

Commands:
  start  Starts the Bloggify process.
  stop   Stops the Bloggify process.

Options:
  -v, --version  Displays version information.
  -h, --help     Displays this help.

Examples:
  $ bloggify start
  $ bloggify stop
  $ bloggify start -c path/to/config/file.json

Documentation can be found at https://github.com/Bloggify/Bloggify.
```

## :clipboard: Example


Here is an example how to use this package as library. To install it locally, as library, you can do that using `npm`:

```sh
$ npm i --save bloggify
```



```js
const Bloggify = require("bloggify");

// Start the Bloggify app
const app = new Bloggify("path/to/the/application/root");

// Do something after it's started
app.onLoad(err => {
    console.log(`Bloggify server running on port ${app._serverPort}`);
});
```

## :question: Get Help

There are few ways to get help:

 1. Please [post questions on Stack Overflow](https://stackoverflow.com/questions/ask). You can open issues with questions, as long you add a link to your Stack Overflow question.
 2. For bug reports and feature requests, open issues. :bug:
 3. For direct and quick help from me, you can [use Codementor](https://www.codementor.io/johnnyb). :rocket:


## :memo: Documentation

For full API reference, see the [DOCUMENTATION.md][docs] file.

## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :dizzy: Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:


 - [`bloggify-cli`](https://github.com/Bloggify/bloggify-cli#readme)—CLI for Bloggify.

## :scroll: License

[MIT][license] © [Bloggify][website]

[license]: http://showalicense.com/?fullname=Bloggify%20%3Csupport%40bloggify.org%3E%20(http%3A%2F%2Fbloggify.org)&year=2014#license-mit
[website]: http://bloggify.org
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
