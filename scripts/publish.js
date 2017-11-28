const exec = require("child_process").execSync
    , rJson = require("r-json")
    , wJson = require("w-json")
    , fs = require("fs")
    , Logger = require("cute-logger")


const ROOT = `${__dirname}/..`
const PACKAGE_JSON_PATH = `${ROOT}/package.json`
const PACKAGE_JSON_PRODUCTION_PATH = `${ROOT}/package.production.json`
const PACKAGE_JSON_DEVELOPMENT_PATH = `${ROOT}/package.development.json`

Logger.log("Initializing...")

const packs = {
    prod: rJson(PACKAGE_JSON_PRODUCTION_PATH)
  , dev: rJson(PACKAGE_JSON_DEVELOPMENT_PATH)
}

const publish = p => {
    p,version = process.argv[2]
    wJson(PACKAGE_JSON_PATH, p)
    exec("npm", ["publish"], {
        cwd: ROOT
      , stdio: "inherit"
    })
}

Logger.log("Publishing bloggify-cli")
publish(packs.dev)

Logger.log("Publishing bloggify")
publish(packs.prod)

Logger.log("Cleaning up")
fs.unlinkSync(PACKAGE_JSON_PATH)

try {
    fs.unlinkSync(`${ROOT}/package-lock.json`)
} catch (e) {}

Logger.log("Done.")
