### Installing `bloggify-cli` Globally

To install Bloggify for development purposes, it is convenient to install the commnad line tool (`bloggify-cli`), globally:

```sh
npm install -g bloggify-cli
```

This will expose the `bloggify` command.
In production, use the `bloggify` package, which is less heavy (e.g. doesn't come with resource bundling etc). It is a lighter version which is designed for production use.


> :bulb: **ProTip!** Install `bloggify-tools` for scrafoolding apps.


### Installing `bloggify-tools`

```sh
npm install -g bloggify-tools
```

### Creating a Blog Application via `bloggify-tools`

We will use the same starting application from the previous guide (the [Quickstart](quickstart.md)), but this time installing everything via `bloggify-tools`.

Run **`bloggify-tools`**. This will open an interactive guide.

```
$ bloggify-tools
? What do you want to do? (Use arrow keys)
❯ Create a blog for me
  Create a blog for somebody else
  Create a custom application
  - Start my app (Disabled)
  - Install a plugin (Disabled)
  - Uninstall a plugin (Disabled)
```

Press <kbd>Return</kbd> and you will be asked to enter some data about your blog.

```
  ℹ️ So, you want to create a new Bloggify app! Cool!
  Please answer the following questions. If you're
  happy with the defaults (the one in parentheses),
  just press the return key.

? Your name: JohnnyB
? Application Template: https://github.com/Bloggify/bloggify-quick-start.git
? Website title: JohnnyB
? Website description: JohnnyB's Blog
? Website theme: bloggify-theme-light
? Production url: http://johnnyb.blog
 ✔ Download the template repository
 ✔ Setting up the git repository
 ✔ Install dependencies (this may take a while)
 ✔ Install the theme
 ✔ Create configuration file.
   🎉 Your app was initialized in the 'johnnyb' directory.
   🎉 To start the app, run:
   🎉   cd johnnyb && npm run start:dev
```

Like in the [Quickstart](quickstart.md), the website will run by default on `localhost:8080`.

Continue reading about [creating a custom app](creating-a-custom-app.md).
