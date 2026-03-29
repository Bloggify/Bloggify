import config from "./config.js"

/**
 * common.url
 * Generates a URL for the given action and options.
 * 
 * @param {string} name - The name of the action.
 * @param {object} opts - Optional parameters for the URL, such as query parameters:
 *   - query: An object representing query parameters to be appended to the URL.
 * @returns {string} The generated URL for the action, including the host and path, and query parameters if provided.
 */
export const url = (name, opts) => {
    const query = opts && opts.query ? `?${new URLSearchParams(opts.query).toString()}` : ""
    return `${config.host}${config.url}/${name}${query}`
}

/**
 * common.wsUrl
 * Generates a WebSocket URL for the given action.
 * 
 * @param {string} name - The name of the action.
 * @returns {string} The generated WebSocket URL for the action, including the host and path.
 */
export const wsUrl = (name) => {
    return `${config.host}${config.ws_url}/${name}`
}