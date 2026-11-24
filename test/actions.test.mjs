import test from "node:test";
import assert from "node:assert/strict";
import createActions from "../lib/actions/index.js";

const setup = (production = false) => {
    const pages = [];
    const logs = [];
    const actions = createActions({
        production,
        log: error => logs.push(error),
        server: { addPage: (...args) => pages.push(args) }
    });
    const context = (query = {}, headers = {}) => {
        const responses = [];
        return {
            query,
            req: { headers },
            end: (...args) => responses.push(args),
            apiMsg: value => responses.push([value]),
            responses
        };
    };
    return { actions, pages, logs, context };
};

test("registers actions at the expected URL and returns JSON data", async () => {
    const { actions, pages, context } = setup();
    actions.get("profile", async () => ({ name: "Ada" }));
    assert.equal(pages[0][0], actions.url("profile"));
    assert.equal(pages[0][1], "get");

    const ctx = context();
    await pages[0][2](ctx);
    assert.deepEqual(ctx.responses, [[{ name: "Ada" }]]);
});

test("passes client errors with their status and metadata", async () => {
    const { actions, pages, context } = setup();
    actions.post("save", async () => {
        throw Object.assign(new Error("Invalid input"), {
            statusCode: 422,
            code: "INVALID",
            metadata: { field: "name" }
        });
    });

    const ctx = context();
    await pages[0][2](ctx);
    assert.deepEqual(ctx.responses, [[{
        message: "Invalid input",
        status: 422,
        code: "INVALID",
        metadata: { field: "name" }
    }, 422]]);
});

test("hides server error details in production", async () => {
    const { actions, pages, logs, context } = setup(true);
    const failure = new Error("database password leaked");
    actions.all("report", async () => { throw failure; });

    const ctx = context();
    await pages[0][2](ctx);
    assert.deepEqual(ctx.responses, [[{ message: "Internal Server Error" }, 500]]);
    assert.deepEqual(logs, [failure]);
});

test("uses HTML response callback for non-JSON requests", async () => {
    const { actions, pages, context } = setup();
    let rendered;
    actions.get("view", async () => ({ title: "Hello" }), (ctx, error, data) => {
        rendered = { ctx, error, data };
    });

    const ctx = context();
    await pages[0][2](ctx);
    assert.deepEqual(rendered, { ctx, error: null, data: { title: "Hello" } });
    assert.deepEqual(ctx.responses, []);
});
