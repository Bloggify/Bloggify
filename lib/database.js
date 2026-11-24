import parseDbUri from "parse-db-uri";
import ul from "ul";

/** Configure the model plugin and session store for a database URI. */
export function configureDatabase(options, { foundModels, modelsDir, production, log }) {
    if (!options.db_uri) {
        return [];
    }

    options.db_options = parseDbUri(options.db_uri);
    if (options.db_uri.endsWith(".sqlite3")) {
        options.db_uri = options.db_options.uri;
    }

    // PostgreSQL accepts both URI schemes; Sequelize uses the postgres dialect.
    if (options.db_options.dialect === "postgresql") {
        options.db_options.dialect = "postgres";
        options.db_uri = options.db_uri.replace(/^postgresql:/, "postgres:");
    }

    const db = options.db_options;
    const corePlugins = [];
    const setSessionStore = (store, storeOptions) => {
        if (options.server.session !== false) {
            options.server.session = ul.deepMerge(options.server.session, {
                store,
                storeOptions
            });
        }
    };

    switch (db.dialect) {
        case "mongodb":
            setSessionStore("connect-mongo", { url: options.db_uri });
            if (foundModels) {
                corePlugins.push(["bloggify-mongoose", Object.assign({
                    uri: options.db_uri,
                    models_dir: modelsDir
                }, db)]);
            }
            break;
        case "mysql":
            setSessionStore("express-mysql-session", {
                user: db.user,
                password: db.password,
                host: db.host,
                port: db.port,
                database: db.database
            });
            if (foundModels) {
                corePlugins.push(["bloggify-sequelize", {
                    uri: options.db_uri,
                    models_dir: modelsDir,
                    options: Object.assign({
                        pool: { max: 5, min: 0, idle: 10000 },
                        logging: production ? false : log,
                        define: { underscored: true }
                    }, db)
                }]);
            }
            break;
        case "postgres":
            setSessionStore("connect-pg-simple", {
                conString: options.db_uri,
                createTableIfMissing: true
            });
            if (foundModels) {
                corePlugins.push(["bloggify-sequelize", {
                    uri: options.db_uri,
                    models_dir: modelsDir,
                    options: Object.assign({
                        pool: { max: 5, min: 0, idle: 10000 },
                        logging: production ? false : log,
                        define: { underscored: true }
                    }, db)
                }]);
            }
            break;
        case "sqlite":
            setSessionStore("express-session-sqlite", {
                path: options.db_uri,
                prefix: "sess:",
                cleanupInterval: 300000
            });
            if (foundModels) {
                corePlugins.push(["bloggify-sequelize", {
                    models_dir: modelsDir,
                    options: Object.assign({
                        storage: options.db_uri,
                        logging: production ? false : log
                    }, db)
                }]);
            }
            break;
    }

    return corePlugins;
}
