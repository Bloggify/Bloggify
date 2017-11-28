const exec = require("spawno")
    , edit = require("edit-json-file")
    , packPath = require("package-json-path")
    , ul = require("ul")


const ROOT = `${__dirname}/..`
const PACKAGE_JSON_PATH = packPath(ROOT)

const pack = edit(PACKAGE_JSON_PATH)
    , copy = ul.clone(pack.data)

// Publish bloggify-cli (development use)
pack.set("name", "bloggify-cli")
exec("npm", ["publish"], {
    cwd: ROOT
}, (err, stdout) => {
    // Disable rucksack in production
    pack.set("dependencies.rucksack", undefined)
    pack.set("name", "bloggify")
    debugger
})
