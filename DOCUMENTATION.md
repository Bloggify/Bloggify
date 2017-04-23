## Documentation

You can see below the API reference of this module.

### `Bloggify(options, adapter)`
Creates a new instance of `Bloggify`.

#### Params
- **Object** `options`: An object containing the following fields:
 - `loadPlugins`: false
 - `plugins`: plugins to load
 - `pluginConfigs`: plugin configs
 - `metadata`:
      - `siteTitle`: the site title
      - `siteDescription`: the site title
      - `domain`: the site domain
 - `corePlugins`: `[ "bloggify-plugin-manager", "bloggify-router" ]`
 - `server`: The lien settings.
 - `theme`:
      - `path`: the theme path (default: `"theme"`)
      - `public`: the theme public directory (default: `"public"`)
 - `adapter`: Adapter settings
      - `paths`:
             - `articles`: the path to the articles dir (default: `"content/articles"`)
             - `pages`: the path to the pages dir (default: `"content/pages"`)
- **BloggifyAdapter** `adapter`: A custom content adapter.

#### Return
- **Bloggify** The `Bloggify` instance.

### `render(lien, templateName, data)`
Renders a template.

#### Params
- **Lien** `lien`: The `lien` object.
- **String** `templateName`: The template name or path.
- **Object** `data`: The template data.

### `registerRouter(router)`
Registers a new router.

#### Params
- **BloggifyRouter** `router`: The Bloggify router to register.

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

