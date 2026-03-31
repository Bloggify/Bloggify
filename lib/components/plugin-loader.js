import { promises as fs } from "fs"
import typpy from "typpy"
import Path from "path"

class BloggifyPluginLoader {

    constructor () {
        this.plugins = {}
    }

    /**
     * getPluginMeta
     * Fetches the plugin's path.
     *
     * @param  {BloggifyPlugin} pluginName The plugin's name.
     * @return {Object} The plugin's path and name.
     */
    async getPluginMeta (pluginName) {
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
                const configFileNames = [
                    `${name}/bloggify.json`,
                    `${name}/bloggify.js`
                ]

                for (const configFileName of configFileNames) {
                    try {
                        ret.config = await import(configFileName, configFileName.endsWith(".json") ? { with: { type: "json" } } : undefined)
                        break;
                    } catch (e) {
                        if (e.code !== "ERR_MODULE_NOT_FOUND") {
                            throw e
                        }
                    }
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

        const pluginMeta = await this.getPluginMeta(plugin)

        Bloggify.log(`Loading plugin '${pluginMeta.name}'`)

        const mod = await import(pluginMeta.full_path)
        let _defaultConfig = pluginMeta.config || {}
        if (_defaultConfig.default) {
            _defaultConfig = _defaultConfig.default
        }
        
        const mergedConfig = { ...(_defaultConfig?.config || {}), ...config }

        const initFunction = mod.default || mod.init || mod
        if (typeof initFunction === "function") {
            await initFunction(mergedConfig)
        }

        this.plugins[plugin] = {
            _module: mod,
            config: mergedConfig,
            name: pluginMeta.name,
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