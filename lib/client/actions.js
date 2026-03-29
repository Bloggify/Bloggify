import { url as commonUrl, wsUrl as commonWsUrl } from "./common/index.js"

let CSRF_TOKEN = null

/**
 * request
 * Executes an HTTP(s) request.
 *
 * @param opts  {Object}    Contains a set of parameters.
 *
 *   - `headers` (Object)    The request headers.
 *   - `url`     (String)    The access URL.
 *   - `action`  (Object)    The action name.
 *   - `method`  (Function)  The request method.
 *   - `data`    (Object)    The reuqest body (will be JSON-stringified)
 *   - `query`   (Object)    Querystring parameters to be set in the url.
 * 
 * @returns {Promise} A promise that resolves with the response data or rejects with an error.
 */
export const request = (opts) => {
    if (!CSRF_TOKEN) {
        const CSRF_META = document.head && document.head.querySelector("[name='csrf-token']")
        CSRF_TOKEN = CSRF_TOKEN || (CSRF_META && CSRF_META.content)
        if (!CSRF_TOKEN) {
            console.warn("Cannot get the CSRF token in the <head> element. Please consider adding `<meta name=\"csrf-token\" content=\"<%= ctx.csrfToken %>\">`")
        }
        if (CSRF_TOKEN === "-") {
            CSRF_TOKEN = undefined;
        }
    }

    opts.headers = opts.headers || {}

    const headers = Object.assign({
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Csrf-Token": CSRF_TOKEN
    }, opts.headers)

    const actionUrl = opts.url || commonUrl(opts.action, opts)

    const fetchHeaders = Object.assign({}, headers)
    const fetchOptions = {
        method: opts.method,
        headers: fetchHeaders
    }

    if (opts.data) {
        if (opts.data instanceof FormData) {
            delete fetchHeaders["Content-Type"]
            fetchOptions.body = opts.data
        } else {
            fetchOptions.body = JSON.stringify(opts.data)
        }
    }

    return fetch(actionUrl, fetchOptions).then(async response => {
        const status = response.status
        let data = {}

        try {
            const text = await response.text()
            data = text ? JSON.parse(text) : {}
        } catch (e) {
            console.warn(e)
        }

        if (status >= 500) {
            const err = new Error(data.error || data.message || "Something went wrong.")
            if (data.metadata) {
                Object.keys(data).forEach(key => {
                    if (key === "message") {
                        return
                    }
                    err[key] = data[key]
                })
            }
            throw err
        }

        if (status === 200) {
            return data
        }

        const err = new Error(data.error || data.message || "Something went wrong.")
        if (data.metadata) {
            Object.keys(data).forEach(key => {
                if (key === "message") {
                    return
                }
                err[key] = data[key]
            })
        }
        throw err
    })
}

/**
 * post
 * Executes a POST request.
 *
 * @param name {String}   The action name.
 * @param data {Object}   The request body (as an object).
 * @param opts {Object}   Additional options (optional).
 * @returns    {Promise} A promise that resolves with the response data or rejects with an error.
 */
export const post = (name, data, opts = {}) => {
    return request(Object.assign({
        method: "POST"
      , action: name
      , data
    }, opts))
}

/**
 * postFile
 * Executes a POST request with a file upload.
 * 
 * @param {string} name - The action name.
 * @param {FormData} formData - The FormData object containing the file and other data to be sent in the request body.
 * @param {object} opts - Additional options for the request (optional).
 * @returns {Promise} A promise that resolves with the response data or rejects with an error.
 */
export const postFile = (name, formData, opts = {}) => {
    return request(Object.assign({
        method: "POST"
      , action: name
      , data: formData
    }, opts))
}

/**
 * get
 * Executes a GET request.
 *
 * @param name {String}   The action name.
 * @param opts {Object}   Additional options (optional).
 * @returns {Promise} A promise that resolves with the response data or rejects with an error.
 */
export const get = (name, opts = {}) => {
    return request(Object.assign({
        method: "GET"
      , action: name
    }, opts))
}

/**
 * url
 * Get the url of the action.
 *
 * @param name {String}   The action name.
 * @param opts {Object}   Additional options (optional).
 * @returns    {String}   The url string.
 */
export const url = commonUrl

/**
 * wsUrl
 * Get the url of the WebSocket action.
 *
 * @param name {String}   The action name.
 * @returns    {String}   The ws url string.
 */
export const wsUrl = commonWsUrl