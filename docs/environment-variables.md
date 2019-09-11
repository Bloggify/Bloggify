## Environment Variables
The following environment variables are interpreted by Bloggify:


 - **`BLOGGIFY_LOG_LEVEL`**
   Defines how verbose should the log be:

   ```env
   # Errors + Warnings + Logs + Info Messages
   BLOGGIFY_LOG_LEVEL=4

   # Errors + Warnings + Logs
   BLOGGIFY_LOG_LEVEL=3

   # Errors + Warnings
   BLOGGIFY_LOG_LEVEL=2

   # Only Errors
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

You can store the environment variables in the `.env` file in the root of the project. It is recommended that you do not add the `.env` file in the git repository. Add it in `.gitignore`.
