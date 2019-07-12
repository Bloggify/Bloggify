const pack = require(`${process.cwd()}/package.json`)
const scripts = pack.scripts

scripts["start"] = "npm run start:prod"
scripts["test"] = "echo \"Error: no test specified\" && exit 1",
scripts["start"] = "npm run start:prod",
scripts["start:dev"] = "bloggify-dev-start -r",
scripts["start:debug"] = "node debug `which bloggify` start -r"
scripts["start:prod"] = "BLOGGIFY_LOG_LEVEL=4 bloggify-prod-start --no-workers",
scripts["start:prod:debug"] = "NODE_ENV=production node debug `which bloggify` start",
scripts["start:prod:debug:devtools"] = "NODE_ENV=production node debug --inspect `which bloggify` start",
scripts["bundle"] = "bloggify-bundle",

require("fs").writeFileSync("package.json", JSON.stringify(pack, null, 2))
