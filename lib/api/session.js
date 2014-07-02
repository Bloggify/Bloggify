var Session = module.exports = {};

/**
 * create
 * Create a new session
 *
 * @name create
 * @function
 * @param {Object} data The session data
 * @param {Function} callback The callback function
 * @return {Object} The session instance
 */
Session.create = function (data, callback) {

    var sid = "_" + Math.random().toString(36)
      , newSession = {
            data: data
          , id: sid
        }
      ;

    // Insert the session object
    Session._col.insert(newSession, function (err, data) {
        if (err) { return callback(err); }
        callback(null, newSession);
    });

    return Session;
};

/**
 * end
 * End a session
 *
 * @name end
 * @function
 * @param {Object} req The request object
 * @param {Function} callback The callback function
 * @return {Object} The session instance
 */
Session.end = function (req, callback) {

    var sid = Session.sid(req);
    if (!sid) {
        return callback(new Error("You are not logged in"));
    }

    // Find session
    Session._col.remove({ id: sid }, callback);
    return Session;
};

/**
 * get
 * Get session data
 *
 * @name get
 * @function
 * @param {Object|String} query The query for session find. If string, it's supposed to be the session id.
 * @param {Function} callback The callback function
 * @return {Object} The session instance
 */
Session.get = function (query, callback) {

    // Handle session id passed as query
    if (typeof query === "string") {
        query = { id: query };
    }

    // Find session
    Session._col.findOne(query, callback);
    return Session;
};

/**
 * sid
 * Returns a session id by providing the request object.
 *
 * @name sid
 * @function
 * @param {Object} req The request object
 * @return {String|null} The session id. If not found, null will be returned.
 */
Session.sid = function (req) {
    var cookies = Utils.parseCookies(req);
    return cookies.sid || null;
};

/**
 * isLoggedIn
 * Returns a boolean (false) if the user is not logged in or session data if the user is logged in.
 *
 * @name isLoggedIn
 * @function
 * @param {Object} req The request object
 * @param {Function} callback The callback function
 * @return {Object} The session instance
 */
Session.isLoggedIn = function (req, callback) {

    var sid = Session.sid(req);
    if (!sid) {
        return callback(null, false);
    }

    return Session.get(sid, callback);
};
