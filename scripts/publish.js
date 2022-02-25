// node scripts/publish <version>

const exec = require("spawno").promise
    , rJson = require("r-json")
    , wJson = require("w-json")
    , fs = require("fs")
    , Logger = require("cute-logger")


const ROOT = `${__dirname}/..`
const PACKAGE_JSON_PATH = `${ROOT}/package.json`
const PACKAGE_JSON_PRODUCTION_PATH = `${ROOT}/package.production.json`
const PACKAGE_JSON_DEVELOPMENT_PATH = `${ROOT}/package.development.json`

Logger.log("Initializing...")

if (!process.argv[2]) {
    throw new Error("Usage: node scripts/publish <version>")
}

const packs = {
    prod: rJson(PACKAGE_JSON_PRODUCTION_PATH)
  , dev: rJson(PACKAGE_JSON_DEVELOPMENT_PATH)
}

const publish = p => {
    p.version = process.argv[2]
    wJson(PACKAGE_JSON_PATH, p)
    return exec("npm", ["publish"], {
        cwd: ROOT
      , output: true
    })
}


try {
    fs.unlinkSync(PACKAGE_JSON_PATH)
} catch (e) {}

Logger.log("Publishing bloggify-cli")
publish(packs.dev).then(() => {
    Logger.log("Publishing bloggify")
    return publish(packs.prod)
}).then(() => {
    Logger.log("Cleaning up")
    fs.unlinkSync(PACKAGE_JSON_PATH)

    try {
        fs.unlinkSync(`${ROOT}/package-lock.json`)
    } catch (e) {}

    Logger.log("Done.")
    return exec("ln", ["-s", "package.development.json", "package.json"], { cwd: ROOT, output: true })
}).catch(console.error)
