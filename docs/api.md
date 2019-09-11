## The Runtime API

Once the app is running, the following information is accessible in the `Bloggify` object — which is an `EventEmitter` instance as well.

### `production` (Boolean)

Whether the application is running in production or not.

### `paths` (Object)

This object contains the path information related to the app:

| Field                             | Description                                                                                                        | Default/Value
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------
| `Bloggify.paths.root`             | The path to the application root.                                                                                  | `/Users/.../your-app`
| `Bloggify.paths.dot_bloggify`     | The path to the application runtime assets folder.                                                                 | `/Users/.../your-app/.bloggify`
| `Bloggify.paths.isProduction`     | Whether the application is in production mode or not. This is used internally. Use `Bloggify.production` instead.  | `false`/`true`
| `Bloggify.paths.envLabel`         | The environment type.                                                                                              | `development`/`production`/`testing`
| `Bloggify.paths.root_public`      | The public directory path.                                                                                         | `'/Users/.../your-app/public'`
| `Bloggify.paths.errors`           | The `errors` directory.                                                                                            | `'/Users/.../your-app/app/errors'`
| `Bloggify.paths.models`           | The `models` directory                                                                                             | `'/Users/.../your-app/app/models'`
| `Bloggify.paths.controllers`      | The `controllers` directory                                                                                        | `'/Users/.../your-app/app/controllers'`
| `Bloggify.paths.routes`           | The `routes` directory                                                                                             | `'/Users/.../your-app/app/routes'`
| `Bloggify.paths.services`         | The `services` directory                                                                                           | `'/Users/.../your-app/app/services'`
| `Bloggify.paths.partials`         | The `partials` directory                                                                                           | `'/Users/.../your-app/app/partials'`
| `Bloggify.paths.actions`          | The `actions` directory                                                                                            | `'/Users/.../your-app/app/actions'`
| `Bloggify.paths.plugins`          | The `plugins` directory                                                                                            | `'/Users/.../your-app/node_modules'`
| `Bloggify.paths.config`           | The `config` path                                                                                                  | `'/Users/.../your-app/bloggify.js'`
| `Bloggify.paths.package`          | The `package.json` file.                                                                                           | `'/Users/.../your-app/package.json'`
| `Bloggify.paths.publicUrls.core`  | This is the assets url.                                                                                            | `'/@/bloggify/assets/'`
| `Bloggify.paths.publicUrls.main`  | The app url (located by default in `app/public`).                                                                  | `'/@/bloggify/public/'`.
| `Bloggify.paths.publicUrls.root`  | The root url.                                                                                                      | `'/'`
| `Bloggify.paths.public.core`      | The assets public path.                                                                                            | `'/Users/.../your-app/.bloggify/public'`
| `Bloggify.paths.public.main`      | The app url (located by default in `app/public`).                                                                  | `'/@/bloggify/public/'`.
| `Bloggify.paths.public.root`      | The root url.                                                                                                      | `'/'`
| `Bloggify.paths.bundleCacheDir`   | The bundle cache directory.                                                                                        | `'/Users/.../your-app/.bloggify/development-bundle-cache'`
| `Bloggify.paths.cssUrlMap`        | The path to a JSON file holding the CSS urls which are public.                                                     | `'/Users/.../your-app/.bloggify/development-css-urls.json'`


### `options` (Object)

This object holds the information from the config file (`bloggify.json` or `bloggify.js`). It can be extended with any field you configure in the config, but the following are important:

| Field                               | Description                                                                                                        | Default/Value
|-------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------
| `Bloggify.options.plugins`          | An array of the plugin names that were loaded.                                                                     | `[]`
| `Bloggify.options.core_plugins`     | The core plugin array.                                                                                             | `[]`
| `Bloggify.options.title`            | The application title.                                                                                             | `package.name`, `""` otherwise
| `Bloggify.options.description`      | The application description.                                                                                       | `package.description`, `""` otherwise
| `Bloggify.options.db_uri`           | The database uri.                                                                                                  |
| `Bloggify.options.server`           | The server options which are passed to [Lien](https://github.com/LienJS/lien).                                     |
| `Bloggify.options.bundler.aliases`  | Configure the `require` aliases. E.g.: `{ "foo": "path/to/foo.js" }`                                               |
| `Bloggify.options.actions`          | Whether to enable the Bloggify Actions or not.                                                                     | `true`
| `Bloggify.options.renderer`         | The renderer plugin.                                                                                               | `"bloggify-template-renderer"` (auto-installed)
| `Bloggify.options.renderers`        | The supported renderers and their options.                                                                         | `{ "ajs": {} }`
| `Bloggify.options.domain`           | The application domain.                                                                                            |
| `Bloggify.options.root`             | The application root path.                                                                                         | `/Users/.../your-app`
| `Bloggify.options.styles`           | The CSS files to load.                                                                                             | `[ 'app/assets/stylesheets/application.css' ]`
| `Bloggify.options.scripts`          | The JS files to load.                                                                                              | `[ 'app/assets/javascripts/application.js' ]`

### `pluginLoader` (Object)

This is the `PluginLoader` instance. Refer to that documentation for more information.

### `errors` (ErrorCreator)

Create custom friendly errors configured in `app/errros`.

### `partials` (Object)

The partial paths.

### `models` (Object)

The model classes.

### `services` (Object)

The service classes.

### `onLoad` (Function)

Call a function when the application is loaded.

**Example:**

```js
Bloggify.onLoad(err => {
    ...
})
```

### `server` (Lien)

The [Lien](https://github.com/LienJS/lien) instance.

### `assets`

The [Rucksack](https://github.com/Bloggify/Rucksack) instance.

### `bundles` (Object)

The asset bundles.

### `package` (Object)

The `package.json` content.

### `renderer` (Renderer)

The Renderer instance.

### `db` (Object)

The database utility.

## Accessing the Config

You can access the configuration by using the `Bloggify.options` object:

```js
{
  // Plugins to load
  plugins: [ 'ajs-components' ],

  // The core plugins, with their configs
  core_plugins:
   [ [ 'bloggify-mongoose', [Object] ],
     [ 'bloggify-flexible-router', [Object] ],
     [ 'bloggify-renderer-ajs', {} ] ],

  // The application title
  title: 'Custom App',
  db_uri: 'mongodb://localhost/db_name',
  db_options:
   { protocols: [ 'mongodb' ],
     protocol: 'mongodb',
     port: null,
     resource: 'localhost',
     user: '',
     pathname: '/db_name',
     hash: '',
     search: '',
     href: 'mongodb://localhost/db_name',
     query: [Object: null prototype] {},
     uri: 'mongodb://localhost/db_name',
     database: 'db_name',
     password: '',
     dialect: 'mongodb',
     host: 'localhost' },
  description: 'My fancy Bloggify app.',
  x_powered_by: 'Bloggify',
  server:
   { errorPages: false,
     public: [ [Array], [Array], [Array] ],
     port: 8080,
     host: null,
     csrf: true,
     session: { store: 'connect-mongo', storeOptions: [Object] } },
  paths:
   { bloggify: '/',
     root_public: 'public',
     bloggify_prefix: '/@/bloggify/',
     plugin: '/@/bloggify/',
     public_main: '/@/bloggify/public/',
     public_assets: '/@/bloggify/assets/',
     css_assets: '/@/bloggify/css-assets/',
     errors: '/app/errors',
     models: '/app/models',
     controllers: '/app/controllers',
     routes: '/app/routes',
     services: '/app/services',
     partials: '/app/partials',
     actions: '/app/actions',
     plugins: '/node_modules',
     config: '/bloggify',
     package: 'package.json' },
  bundler:
   { aliases:
      { bloggify:
         '/Users/your-app/node_modules/bloggify-cli/lib/client/index.js',
        'bloggify/actions':
         '/Users/.../your-app/node_modules/bloggify-cli/lib/client/actions.js',
        'bloggify/actions/common':
         '/Users/.../your-app/node_modules/bloggify-cli/lib/client/common' } },
  actions: true,
  renderer: 'bloggify-template-renderer',
  renderers: { ajs: {} },
  domain: 'http://your-app.com',
  root: '/Users/.../your-app',
  styles: [ 'app/assets/stylesheets/application.css' ],
  scripts: [ 'app/assets/javascripts/application.js' ],
  _bundler: [Function: Rucksack],
  Renderer: [Function: BloggifyTemplateRenderer] }
```
