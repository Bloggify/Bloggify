## Documentation

You can see below the API reference of this module.

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

