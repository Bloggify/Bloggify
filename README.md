
# bloggify-js-renderer

 [![Version](https://img.shields.io/npm/v/bloggify-js-renderer.svg)](https://www.npmjs.com/package/bloggify-js-renderer) [![Downloads](https://img.shields.io/npm/dt/bloggify-js-renderer.svg)](https://www.npmjs.com/package/bloggify-js-renderer)

> JS renderer for Bloggify.

## :cloud: Installation

```sh
$ npm i --save bloggify-js-renderer
```


After installing the module, make sure you add `bloggify-js-renderer` in the `plugins` list.

## :clipboard: Example



```js
// The js views should export a function
module.exports = (ctx, cb) => {
    cb(null, {
        users: [
            "Alice",
            "Bob"
        ]
    });
};
```

## :question: Get Help

There are few ways to get help:

 1. Please [post questions on Stack Overflow](https://stackoverflow.com/questions/ask). You can open issues with questions, as long you add a link to your Stack Overflow question.
 2. For bug reports and feature requests, open issues. :bug:
 3. For direct and quick help from me, you can [use Codementor](https://www.codementor.io/johnnyb). :rocket:


## :memo: Documentation


### `render(ctx, path, data, cb)`
Renders the file.

#### Params
- **ctx** `ctx`: The context.
- **String** `path`: The file path.
- **Object** `data`: The template data.
- **Function** `cb`: The callback function.



## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].



## :scroll: License

[MIT][license] © [Bloggify][website]

[license]: http://showalicense.com/?fullname=Bloggify%20%3Csupport%40bloggify.org%3E%20(https%3A%2F%2Fbloggify.org)&year=2016#license-mit
[website]: https://bloggify.org
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
