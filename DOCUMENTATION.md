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

### `getArticleById(id, cb)`
Gets a specific article, by id.

#### Params
- **String** `id`: The article id.
- **Function** `cb`: The callback function.

### `getArticles(query, cb)`
Get multiple articles.

#### Params
- **Object** `query`: The query.
- **Function** `cb`: The callback function.

### `createArticle(title, content, custom, cb)`
Create a new article.

#### Params
- **String** `title`: The article title.
- **String** `content`: The article content.
- **Object** `custom`: Custom data.
- **Function** `cb`: The callback function.

### `saveArticle(id, title, content, custom, cb)`
Saves an existing article.

#### Params
- **String** `id`: The article id.
- **String** `title`: The article title.
- **String** `content`: The article content.
- **Object** `custom`: Custom data.
- **Function** `cb`: The callback function.

### `deleteArticle(id, cb)`
Delete an article.

#### Params
- **String** `id`: The article id.
- **Function** `cb`: The callback function.

### `deleteArticles(ids, cb)`
Delete multiple articles.

#### Params
- **Array** `ids`: A list of ids.
- **Function** `cb`: The callback function.

### `getPageBySlug(slug, cb)`
Get a page by the slug.

#### Params
- **String** `slug`: The page slug.
- **Function** `cb`: The callback function.

### `getPages(query, cb)`
Get multiple pages.

#### Params
- **Object** `query`: The query object.
- **Function** `cb`: The callback function.

### `createPage(title, content, custom, cb)`
Create a new page.

#### Params
- **String** `title`: The article title.
- **String** `content`: The article content.
- **Object** `custom`: Custom data.
- **Function** `cb`: The callback function.

### `savePage(title, content, custom, cb)`
Saves a page.

#### Params
- **String** `title`: The article title.
- **String** `content`: The article content.
- **Object** `custom`: Custom data.
- **Function** `cb`: The callback function.

### `deletePage(slug, cb)`
Delete a page.

#### Params
- **String** `slug`: The page slug.
- **Function** `cb`: The callback function.

### `deletePages(slugs, cb)`
Delete multiple pages.

#### Params
- **Array** `slugs`: An array of slugs.
- **Function** `cb`: The callback function.

