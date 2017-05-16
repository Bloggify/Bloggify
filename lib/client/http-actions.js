const common = require("./common");

let CSRF_TOKEN = null;

module.exports = {
    request (opts, cb) {
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
        const url = common.url(opts.action, opts);

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
                        const data = JSON.parse(xhr.responseText);
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
