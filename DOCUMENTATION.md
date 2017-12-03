## Documentation

You can see below the API reference of this module.

### `Bloggify(options)`
Creates a new instance of `Bloggify`.

#### Params

- **Object** `options`: An object containing the following fields:
  - `plugins` (Array): The plugins to load. A specific element should be
    either a string or an array of two values (the value name and the
    configuration object).

    Example:

    ```js
    [
       // Load the web sockets module
       "ws"
     , ["some-interesting-module",{
         "and": "some",
         "interesting": "configuration"
       }]
    ]
    ```

    **Note**: If the module name starts with `bloggify-`, you can omit
    that part of the name.
    Example: To load `bloggify-ws`, you can simply use `ws`.

  - `core_plugins` (Array): Like `plugins`, but these have greater
     priority when starting the app.

     There are some additional core plugins which are loaded automatically.

     The specific order of loading core plugins is:

      0. Models (sequelize/mongoose)
      1. Custom plugins configured in `bloggify.js(on)`
      2. Actions
      3. Router
      4. Renderer(s)

  - `title` (String): The application name. For convenience (in case it's
     not set), the default is an empty string (`""`).

  - `description` (String): The application description. For convenience
     (in case it's not set), the default is an empty string (`""`).

  - `db_uri` (String): The database URI. It can be set in the options,
     or via an environment variable: `DB_URI`. The recommended way is
     to use the environment variable set in the `.env` file or in the
     deployment platform settings (e.g. Heroku).

     The uri is parsed and the specific dialect is handled. Currently,
     these dialects are supported:

     **`mongodb`**

     URI: `mongodb://localhost/your-database-name`
     Needed peer dependencies: `connect-mongo`, `bloggify-mongoose`

     You need to install these in your app folder:

     ```sh
     npm install connect-mongo bloggify-mongoose
     ```

     If no models are used, you don't need to install
     `bloggify-mongoose`. `connect-mongo` will be used for
     session management.

     The models will be created in the models folder (default: `app/models`).

     Example:

     **`Topic.js`**
     ```
     const TopicSchema = new Bloggify.db.Schema({
         title: {
             type: String,
             text: true
         },
         body: {
             type: String,
             text: true
         },
     })
     module.exports = Bloggify.db.model("Topic", TopicSchema)
     ```

     **`mysql`**

     URI: `DB_URI=mysql://root:password@host:port/your-database-name`
     Needed peer dependencies: `express-mysql-session`, `bloggify-sequelize`

     You need to install these in your app folder:

     ```sh
     npm install connect-mongo bloggify-mongoose
     ```

     If no models are used, you don't need to install
     `bloggify-mongoose`. `connect-mongo` will be used for
     session management.

     The models will be created in the models folder (default: `app/models`).

     Example:

     **`User.js`**

     ```js
     const Sequelize = Bloggify.sequelize

     const Subject = Sequelize.db.define("subject", {
         name: {
             type: Sequelize.STRING
         }
     }, {
         charset: "utf8mb4"
     })

     module.exports = Subject
     ```

  -  `db_options` (Object): Additional options to be passed to the
     database plugin (`bloggify-sequelize` or `bloggify-mongoose`).
  - `server` (Object) Server ([`lien`](https://github.com/lienjs/lien)) related settings.
    - `port` (Boolean): The server's port (default: `process.env.PORT || 8080`).
    - `host` (Boolean): The server's host (default: `null`).
    - `csrf` (Boolean): Wether to enable csrf validation or not (default: `true`).
    - `session` (Object|Boolean): The session settings, or `false` to
       disable the session management. In most of the cases you will
       not need to change this.
  - `paths` (Object): The paths options. Do *not* change these unless you have a good reason.
    - `bloggify` (String): The Bloggify directory (by default the root of the app).
    - `public_main` (String): The public directory endpoint (default: `"/@/bloggify/public/"`)
    - `public_assets` (String): The public core endpoint (default: `"/@/bloggify/assets/"`)
    - `css_assets` (String): The CSS assets endpoint (default: `"/@/bloggify/css-assets/"`)
    - `errors` (String): (default: `"/app/errors"`)
    - `models` (String): (default: `"/app/models"`)
    - `controllers` (String): (default: `"/app/controllers"`)
    - `routes` (String): (default: `"/app/routes"`)
    - `services` (String): (default: `"/app/services"`)
    - `views` (String): (default: `"/app/views"`)
    - `actions` (String): (default: `"/app/actions"`)
    - `plugins` (String): (default: `"/node_modules"`)
    - `config` (String): The config file: `bloggify.js(on)` (default: `"/bloggify"`).
    - `package` (String): The `package.json` file path (default: `"package.json"`).
  - `bundler` (Object): The bundler options (see [`rucksack`](https://github.com/Bloggify/rucksack)).
    - `aliases` (Object): The aliases that should be made in the scripts.By default, the following are included. If needed, you can extend with yours:
      - `bloggify` :arrow_right: `${__dirname}/client/index.js`
      - `bloggify/actions` :arrow_right: `${__dirname}/client/actions.js`
      - `bloggify/actions/common` :arrow_right: `${__dirname}/client/common`
  - `renderer` (String): The module to be used for rendering (default: `"bloggify-template-renderer"`).
  - `renderers` (Object): An object containing the renderer options.
    - `ajs`: {}

#### Return
- **Bloggify** The `Bloggify` instance.

### `render(lien, templateName, data)`
Renders a template.

#### Params

- **Lien** `lien`: The `lien` object.
- **String** `templateName`: The template name or path.
- **Object** `data`: The template data.

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

### `extend(methods)`
Extends the Bloggify instance with new methods.

#### Params

- **Object** `methods`: An object containing functions you want to append to the `Bloggify` instance.

#### Return
- **Bloggify** The `Bloggify` instance.

