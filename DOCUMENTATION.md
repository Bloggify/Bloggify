## Documentation

You can see below the API reference of this module.

### `BloggifyPaths(root, options, bloggifyInstance)`
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
Initializes the path values (documented above).

### `getBundlePaths(name)`
Get the bundle paths for a bundle name.

#### Params
- **String** `name`: The bundle name (default: `main`).

#### Return
- **Object** An object containing the following fields:
 - `urls`: The URL endpoints.
   - `js` (String): The JavaScript bundle url.
   - `css` (String): The CSS bundle url.

 - `local`: The local paths.
   - `js` (String): The JavaScript bundle local path.
   - `css` (String): The CSS bundle local path.

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

### `staticFilePath(filePath, absolute)`
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

