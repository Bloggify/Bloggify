import { promises as fs } from "fs"
import typpy from "typpy"
import Path from "path"

class BloggifyPluginLoader {

    constructor () {
        this.plugins = {}
    }

    /**
     * getPluginPath
     * Fetches the plugin's path.
     *
     * @param  {BloggifyPlugin} pluginName The plugin's name.
     * @return {Object} The plugin's path and name.
     */
    async getPluginPath (pluginName) {
        const tries = [
            `bloggify-${pluginName}`,
            pluginName
        ]

        let ret = null
        for (const name of tries) {
             try {
                ret = {
                    full_path: import.meta.resolve(name),
                    name
                }
                break;
            } catch (e) {
                if (e.code !== "ERR_MODULE_NOT_FOUND") {
                    throw e
                }
            }
        }

        if (!ret) {
            throw new Error(`Cannot find plugin '${pluginName}'`)
        }

        return ret
    }

    async load (plugin) {
        let config = {}
        if (Array.isArray(plugin)) {
            config = plugin[1]
            plugin = plugin[0]
        }

        if (this.plugins[plugin]) {
            return this.plugins[plugin]
        }

        const fullPath = await this.getPluginPath(plugin)

        Bloggify.log(`Loading plugin '${fullPath.name}'`)

        const mod = await import(fullPath.full_path)

        const initFunction = mod.default || mod.init || mod
        if (typeof initFunction === "function") {
            await initFunction(config)
        }

        this.plugins[plugin] = {
            _module: mod,
            config,
            name: fullPath.name,
            init: initFunction
        }
            
        Bloggify.emit("plugin-loaded", this.plugins[plugin])

        return this.plugins[plugin]
    }

    async loadMultiple (names) {
        for (const plugin of names) {
            await this.load(plugin)
        }
    }
} 

export default BloggifyPluginLoader