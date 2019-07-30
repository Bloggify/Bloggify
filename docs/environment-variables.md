
   BLOGGIFY_LOG_LEVEL=3

   # Warnings
   BLOGGIFY_LOG_LEVEL=2

   # Errors
   BLOGGIFY_LOG_LEVEL=1
   ```

 - **`PORT`**
   Set the port. This will be set automatically by your deployment service.

   Examples:

   ```env
   # Start the app on port 9000
   PORT=9000
   ```

 - **`NODE_ENV`**
   If set to `production`, it will make your app to start in production mode.

### The `.env` file

You can store the enviroment variables in the `.env` file in the root of the project. It is recommended that you do not add the `.env` file in the git repository. Add it in `.gitignore`.
