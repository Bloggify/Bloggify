In this quickstart guide you will learn how to set up a blog application using Bloggify and then how to build a custom application.

### Prerequisites

You need to have some prerequisites installed:

 - Node.js (preferably `>=8.0.0`). Check out [nodejs.org](https://nodejs.org/en/) how to install.
 - `npm`, installed by the Node.js installer, by default.
 - `git` (we use this to communicate with GitHub)

### Installation

Bloggify will be installed as `npm` dependency when doing `npm install`, below.

```sh
# Clone the quickstart repository
git clone https://github.com/Bloggify/bloggify-quick-start.git

# Open the directory
cd bloggify-quick-start

# Install the dependencies
npm install

# Run the app
npm run start:dev
```

Then open `localhost:8080` (`8080` is the default port).

---

### File Structure

The files are structured like below:

```
.
├── package.json                 # Dependencies, repo information etc.
├── bloggify.json                # Bloggify related metadata and configuration
├── app                          # The application directory
│   └── public                    # The public directory
│       └── images                # Images used in the theme
│           ├── article-img.png   # The image for the article items (in the left-top corner)
│           └── logo.png          # The top image on the pages
└── content                      # The content directory (articles and pages)
    ├── articles                 # The articles directory
    │   ├── 1.md                  ...
    │   ├── 2.md
    │   ├── 3.md
    │   └── 4.md
    └── pages                    # The pages directory
        ├── bar.md                ...
        ├── blog.md
        ├── foo.md
        └── home.md
```

### Configuration

The `bloggify.json` or `bloggify.js` should contain the application configuration. In this starter, the configuration
looks like below:

```js
{
    // The title of the application
    "title": "Bloggify Starter"

    // Description
  , "description": "Welcome to Bloggify Starter!"

    // Production domain (used for SEO)
  , "domain": "https://example.com"

    // Plugins to load (they should be listed in
    // package.json as well to be installed via
    // `npm install`
  , "plugins": [
      "emoji"
    , ["markdown-highlight", { "theme": "ascetic" }]
    ]

    // The adapter is just another plugin that takes
    // care of interpreting the /content directory
    // In this example we use the Markdown adapter
  , "adapter": ["bloggify-markdown-adapter", {

        // Adapter config (routes etc)
        "routes": {
            "articles": "/blog",
            "blog_url": "/blog",
            "blog": "blog",
            "home": "home"
        }

        // The theme to load (has to be installed
        // via `npm install`)
      , "theme": ["theme-light", {

            // The theme configuration
            "options": {
                "social": {
                    "twitter": "Bloggify"
                }
            }
        }]
    }]
}
```

Continue reading about how to use the [cli tools for Bloggify](cli-tools.md) and [creating a custom app](creating-a-custom-app.md).
