/*global Enumerator: false, ActiveXObject: false */

"use strict"

const common = require("./common")

let CSRF_TOKEN = null

module.exports = {

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
     * @param cb    {Function}  The callback function.
     */
    request (opts, cb) {
        const CSRF_META = document.head && document.head.querySelector("[name='csrf-token']")
        CSRF_TOKEN = CSRF_TOKEN || (CSRF_META && CSRF_META.content)
        if (!CSRF_TOKEN) {
            console.warn("Cannot get the CSRF token in the <head> element. Please consider adding `<meta name=\"csrf-token\" content=\"<%= ctx.csrfToken %>\">`")
        }

        opts.headers = opts.headers || {}

        const headers = Object.assign({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Csrf-Token": CSRF_TOKEN
        }, opts.headers)

        const url = opts.url || common.url(opts.action, opts)

        return new Promise((resolve, reject) => {
            const xhr = typeof XMLHttpRequest !== "undefined" ?
                          new XMLHttpRequest()
                        : new ActiveXObject("Microsoft.XMLHTTP")

            xhr.open(opts.method, url, true)

            Object.keys(headers).forEach(header => {
                const val = headers[header]
                if (val) {
                    xhr.setRequestHeader(header, val)
                }
            })

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    let status = xhr.status
                    if (status >= 500) {
                        const err = new Error("Server error.")
                        if (cb) cb(err)
                        reject(err)
                    } else {
                        let data = {}
                        try {
                            data = JSON.parse(xhr.responseText)
                        } catch (e) {
                            console.warn(e)
                        }
                        if (status === 200) {
                            if (cb) cb(null, data)
                            resolve(data)
                        } else {
                            const err = new Error(data.error || data.message || "Something went wrong.")
                            if (cb) cb(err, data)
                            reject(err)
                        }
                    }
                }
            }

            if (opts.data) {
                if (!(opts.data instanceof FormData)) {
                    opts.data = JSON.stringify(opts.data)
                }
                xhr.send(opts.data)
            } else {
                xhr.send()
            }
        })
    }

    /**
     * post
     * Executes a POST request.
     *
     * @param name {String}   The action name.
     * @param data {Object}   The request body (as an object).
     * @param opts {Object}   Additional options (optional).
     * @param cb   {Function} The callback function.
     */
  , post (name, data, opts, cb) {
        if (typeof opts === "function") {
            cb = opts
            opts = {}
        }
        return this.request(Object.assign({
            method: "POST"
          , action: name
          , data
        }, opts), cb)
    }

    /**
     * get
     * Executes a GET request.
     *
     * @param name {String}   The action name.
     * @param opts {Object}   Additional options (optional).
     * @param cb   {Function} The callback function.
     */
  , get (name, opts, cb) {

        if (typeof opts === "function") {
            cb = opts
            opts = {}
        }
        return this.request(Object.assign({
            method: "GET"
          , action: name
        }, opts), cb)
    }

    /**
     * url
     * Get the url of the action.
     *
     * @param name {String}   The action name.
     * @param opts {Object}   Additional options (optional).
     * @returns    {String}   The url string.
     */
  , url: common.url

    /**
     * wsUrl
     * Get the url of the WebSocket action.
     *
     * @param name {String}   The action name.
     * @returns    {String}   The ws url string.
     */
  , wsUrl: common.wsUrl
}
