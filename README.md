
# bloggify-paths

 [![Patreon](https://img.shields.io/badge/Support%20me%20on-Patreon-%23e6461a.svg)][patreon] [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/bloggify-paths.svg)](https://www.npmjs.com/package/bloggify-paths) [![Downloads](https://img.shields.io/npm/dt/bloggify-paths.svg)](https://www.npmjs.com/package/bloggify-paths) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> Helper library for maintaining the Bloggify paths in one place.

## :cloud: Installation

```sh
$ npm i --save bloggify-paths
```


## :clipboard: Example



```js
const BloggifyPaths = require("bloggify-paths");

const Bloggify = { /* The Bloggify instance */ };

// Create a new instance of BloggifyPaths
console.log(new BloggifyPaths("~/path/to/my/app", {
    paths: {
        // Override the default (bloggify.js) with a JSON path.
        config: "bloggify.json"
    }
}, Bloggify));
// BloggifyPaths {
//   root: '/home/.../path/to/my/app',
//   _: {},
//   _paths:
//    { bloggify: '/',
//      config: 'bloggify.json',
//      plugins: '/node_modules',
//      publicMain: '/!/bloggify/public/',
//      publicCore: '/!/bloggify/core/',
//      publicTheme: '/!/bloggify/theme/' },
//   bloggify: '/home/.../path/to/my/app/',
//   config: '/home/.../path/to/my/app/bloggify.json',
//   plugins: '/home/.../path/to/my/app/node_modules',
//   publicMain: '/home/.../path/to/my/app/!/bloggify/public/',
//   publicCore: '/home/.../path/to/my/app/!/bloggify/core/',
//   publicTheme: '/home/.../path/to/my/app/!/bloggify/theme/' }
```

## :memo: Documentation


### constructor

BloggifyPaths
Creates a new instance of `BloggifyPaths`.

The instance contains the following fields:

 - `publicUrls`: The url endpoints (accesible via HTTP)
   - `core`: The core public url.
   - `main`: The application public url.
   - `theme`: The theme public url.
   - `root`: The root public url.

 - `public`: The file system paths.
   - `core`: The path to the core public directory.
   - `main`: The application public directory.
   - `theme`: The theme public directory.
   - `root`: The root public directory.

 - `_bundles`: The relative bundle urls.
   - `js`: it takes the following value: `/js/index.js`
   - `css`: it takes the following value: `/css/index.css`

 - `bundleUrls`: The bundle urls.
   - `js`: The absolute url of the js bundle.
   - `css`: The absolute url of the css bundle.

 - `bundlePaths`: The bundle paths.
   - `js`: The absolute path of the js bundle.
   - `css`: The absolute path of the css bundle.

 - `_publicPaths`: An array of pairs of url endpoints and disk paths.

#### Params
- **String** `root`: The path to the application's root.
- **Object** `options`: The Bloggify options. The `paths` object will be merged with the following defaults:
 - `bloggify` (String): The bloggify directory (by default the root).
 - `config` (String): The configuration file path (default: `/bloggify.js`).
 - `plugins` (String): The path to the plugins directory (default: `/node_modules`)>
 - `publicMain` (String): The public main directory endpoint (default: `"/!/bloggify/public/"`).
 - `publicCore` (String): The public core directory endpoint (default: `"/!/bloggify/core/"`).
 - `publicTheme` (String): The public theme directory endpoint (default: `"/!/bloggify/theme/"`).
- **Bloggify** `bloggifyInstance`: The Bloggify instance.

#### Return
- **Object** The BloggifyPaths instance.

### `initPublicPaths()`
Initializes path values (documented above).

### `getPublicPaths()`
Fetches the public paths of the app.

#### Return
- **Array** The public paths.

### `getMainPublic(fromDisk)`
Returns the path to the app's public directory/uri.

#### Params
- **Boolean** `fromDisk`: Establishes the source of the public directory.

#### Return
- **String** The public path.

### `getThemePublic(fromDisk)`
Returns the path to the theme's public directory/uri.

#### Params
- **Boolean** `fromDisk`: Establishes the source of the public directory.

#### Return
- **String** The public path.

### `FilePath(filePath, absolute)`
staticFilePath
Gets the url of a file.

#### Params
- **String** `filePath`: The file path.
- **Boolean** `absolute`: If `true`, the absolute path will be returned.

#### Return
- **String** The file url.

### `prepare()`
Initializes the paths values.

### `pluginPath(name)`
Fetches the path of the plugin.

#### Params
- **String** `name`: The plugin's name.

#### Return
- **type** The plugin's path.



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
