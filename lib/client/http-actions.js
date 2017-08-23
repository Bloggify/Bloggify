const common = require("./common");

let CSRF_TOKEN = null;

module.exports = {
    request (opts, cb) {
        
        /**
        * request
        * Reaches out to the needed execution resources.
        *
        * @param opts  {Object}    Contains a set of parameters.
        *  - `headers` (Object)    The request headers.
        *  - `url`     (String)    The access URL.
        *  - `action`  (Object)    The action name.
        *  - `method`  (Function)  The request method.
        *  - `data`    (String)    The request body.
        * @param cb    {Function}  The callback function.
        */
        
        const CSRF_META = document.head && document.head.querySelector("[name='csrf-token']");
        CSRF_TOKEN = CSRF_TOKEN || (CSRF_META && CSRF_META.content);
        if (!CSRF_TOKEN) {
            console.warn("Cannot get the CSRF token in the <head> element. Please consider adding it.");
        }

        opts.headers = opts.headers || {};

        const headers = Object.assign({
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Csrf-Token": CSRF_TOKEN
        }, opts.headers);
        const url = opts.url || common.url(opts.action, opts);

        return new Promise((resolve, reject) => {
            const xhr = typeof XMLHttpRequest !== "undefined"
                    ? new XMLHttpRequest()
                    : new ActiveXObject("Microsoft.XMLHTTP")
                    ;

            xhr.open(opts.method, url, true);

            Object.keys(headers).forEach(header => {
                xhr.setRequestHeader(header, headers[header]);
            });

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    let status = xhr.status;
                    if (status >= 500) {
                        const err = new Error("Server error.");
                        cb && cb(err);
                        reject(err);
                    } else {
                        let data = {};
                        try {
                            data = JSON.parse(xhr.responseText);
                        } catch (e) {
                            console.warn(e);
                        }
                        if (status === 200) {
                            cb && cb(null, data);
                            resolve(data);
                        } else {
                            const err = new Error(data.error || data.message || "Something went wrong.");
                            cb && cb(err, data);
                            reject(err);
                        }
                    }
                }
            };

            if (opts.data) {
                xhr.send(JSON.stringify(opts.data));
            } else {
                xhr.send();
            }
        });
    }
  , post (name, data, opts, cb) {
      
        /**
        * post
        * Posts with the specified parameters.
        *
        * @param name {String}   The action name.
        * @param data {String}   Contains the assigned object's process info.
        * @param opts {Object}   Contains a set of parameters.
        * @param cb   {Function} The callback function.
        */
      
        if (typeof opts === "function") {
            cb = opts;
            opts = {};
        }
        return this.request(Object.assign({
            method: "POST"
          , action: name
          , data
        }, opts), cb);
    }
  , get (name, opts, cb) {
      
        /*
        * get
        * Loads data from the information provided.
        *
        * @param name {String}   The action name.
        * @param opts {Object}   Contains a set of parameters.
        * @param cb   {Function} The callback function.
        */
      
        if (typeof opts === "function") {
            cb = opts;
            opts = {};
        }
        return this.request(Object.assign({
            method: "GET"
          , action: name
        }, opts), cb);
    }
};
