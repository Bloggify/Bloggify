import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Bloggify from "../lib/index.js";

class TestBundler {
    async bundle() {}
}

async function fixture(t, config, { models = false, actions = false, configText } = {}) {
    const root = await mkdtemp(join(tmpdir(), "bloggify-startup-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "test-app" }));
    await writeFile(join(root, "bloggify.json"), configText ?? JSON.stringify({
        renderers: false,
        server: { port: 0, session: false, csrf: false },
        ...config
    }));
    if (models) await mkdir(join(root, "app/models"), { recursive: true });
    if (actions) await mkdir(join(root, "app/actions"), { recursive: true });
    const app = new Bloggify({ root, _bundler: TestBundler });
    t.after(async () => { await app.server?.close(); });
    return app;
}

test("loads JSON config and invokes ready callbacks before and after startup", async t => {
    const app = await fixture(t, { title: "From JSON" });
    let firstCalled = false;
    await app.ready(() => { firstCalled = true; });
    assert.equal(firstCalled, true);
    assert.equal(app.options.title, "From JSON");
    assert.deepEqual(app.options.core_plugins, []);

    let lateCalled = false;
    await app.ready(() => { lateCalled = true; });
    assert.equal(lateCalled, true);
});

test("plugin load failure rejects readiness and keeps generated plugins after custom plugins", async t => {
    const app = await fixture(t, { core_plugins: ["missing-test-plugin"] }, {
        models: true,
        actions: true
    });
    let pluginsLoaded = false;
    app.on("plugins-loaded", () => { pluginsLoaded = true; });

    await assert.rejects(app.ready(), /Cannot find plugin 'missing-test-plugin'/);
    assert.deepEqual(app.options.core_plugins, ["missing-test-plugin", "bloggify-actions"]);
    assert.equal(pluginsLoaded, false);
    assert.equal(app._ready, undefined);
    await assert.rejects(app.ready(), /Cannot find plugin 'missing-test-plugin'/);
});

test("invalid configuration rejects onLoad and ready before the server starts", async t => {
    const app = await fixture(t, {}, { configText: "{ invalid JSON" });
    await assert.rejects(app.onLoad(), SyntaxError);
    await assert.rejects(app.ready(), SyntaxError);
    assert.equal(app.server, undefined);
});
