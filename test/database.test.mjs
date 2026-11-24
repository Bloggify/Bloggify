import test from "node:test";
import assert from "node:assert/strict";
import { configureDatabase } from "../lib/database.js";

const configure = (db_uri, { foundModels = true, session = true, production = false } = {}) => {
    const options = { db_uri, server: { session } };
    const log = () => {};
    const plugins = configureDatabase(options, {
        foundModels,
        modelsDir: "/app/models",
        production,
        log
    });
    return { options, plugins, log };
};

for (const scheme of ["postgres", "postgresql"]) {
    test(`${scheme} URI configures PostgreSQL models and sessions`, () => {
        const { options, plugins, log } = configure(`${scheme}://user:secret@db.example:5432/app`);
        const uri = "postgres://user:secret@db.example:5432/app";

        assert.equal(options.db_uri, uri);
        assert.equal(options.db_options.dialect, "postgres");
        assert.deepEqual(options.server.session, {
            store: "connect-pg-simple",
            storeOptions: { conString: uri, createTableIfMissing: true }
        });
        assert.equal(plugins.length, 1);
        assert.equal(plugins[0][0], "bloggify-sequelize");
        assert.equal(plugins[0][1].uri, uri);
        assert.equal(plugins[0][1].models_dir, "/app/models");
        assert.equal(plugins[0][1].options.dialect, "postgres");
        assert.deepEqual(plugins[0][1].options.pool, { max: 5, min: 0, idle: 10000 });
        assert.deepEqual(plugins[0][1].options.define, { underscored: true });
        assert.equal(plugins[0][1].options.logging, log);
    });
}

test("PostgreSQL models work with sessions disabled", () => {
    const { options, plugins } = configure("postgres://user:secret@db.example/app", {
        session: false
    });
    assert.equal(plugins[0][0], "bloggify-sequelize");
    assert.equal(options.server.session, false);
});

test("PostgreSQL sessions work without a models directory", () => {
    const { options, plugins } = configure("postgres://user:secret@db.example/app", {
        foundModels: false
    });
    assert.deepEqual(plugins, []);
    assert.equal(options.server.session.store, "connect-pg-simple");
});

test("PostgreSQL suppresses SQL logging in production", () => {
    const { plugins } = configure("postgres://user:secret@db.example/app", { production: true });
    assert.equal(plugins[0][1].options.logging, false);
});

test("MySQL still configures its session store and Sequelize plugin", () => {
    const { options, plugins } = configure("mysql://user:secret@db.example:3306/app");
    assert.equal(options.server.session.store, "express-mysql-session");
    assert.deepEqual(options.server.session.storeOptions, {
        user: "user", password: "secret", host: "db.example", port: 3306, database: "app"
    });
    assert.equal(plugins[0][0], "bloggify-sequelize");
    assert.equal(plugins[0][1].options.dialect, "mysql");
});

test("SQLite still uses its file for models and sessions", () => {
    const { options, plugins } = configure("sqlite://data/db.sqlite3");
    assert.equal(options.db_uri, "data/db.sqlite3");
    assert.equal(options.server.session.store, "express-session-sqlite");
    assert.equal(options.server.session.storeOptions.path, "data/db.sqlite3");
    assert.equal(plugins[0][1].options.storage, "data/db.sqlite3");
});

test("MongoDB still uses its session store and Mongoose plugin", () => {
    const { options, plugins } = configure("mongodb://db.example/app");
    assert.equal(options.server.session.store, "connect-mongo");
    assert.equal(plugins[0][0], "bloggify-mongoose");
    assert.equal(plugins[0][1].models_dir, "/app/models");
});

test("No database URI leaves sessions alone", () => {
    const { options, plugins } = configure(undefined);
    assert.deepEqual(plugins, []);
    assert.equal(options.server.session, true);
});
