// alternative to express-session for session storage
// we want to make use of express-session to set the sessionID
// store session data for all sessions in express app memory
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const Constants = require('./constants');

class Sessions {

  constructor(configs) {
    this._data = {};
    this.inactiveDurationSec = configs.inactive;
    this.maxSessionCount = configs.maxCount;
    this.logger = configs.logger;
    if (!Sessions.classLogger) {
      Sessions.classLogger = this.logger;
    }

    this.getSessionCount = this.getSessionCount.bind(this);
    this.maxSessionCountReached = this.maxSessionCountReached.bind(this);
    this.deleteOldestInactiveSession = this.deleteOldestInactiveSession.bind(this);
    this.initialize = this.initialize.bind(this);
    this._get = this._get.bind(this);
    this._set = this._set.bind(this);
    this.getLastActive = this.getLastActive.bind(this);
    this.setLastActive = this.setLastActive.bind(this);
    this.getClientId = this.getClientId.bind(this);
    this.setClientId = this.setClientId.bind(this);
    this.getAppId = this.getAppId.bind(this);
    this.setAppId = this.setAppId.bind(this);
    this.setAccountId = this.setAccountId.bind(this);
    this.getAccountId = this.getAccountId.bind(this);
    this.getClientApps = this.getClientApps.bind(this);
    this.setClientApps = this.setClientApps.bind(this);
    this.setProperties = this.setProperties.bind(this);
  }

  static getIdFromCookie(req) {
    // chrome uses headers, firefox and safari use sessionID
    let cookieID;
    if (req.headers && req.headers.cookie) {
      const cookieString = req.headers.cookie;
      const cookies = cookie.parse(cookieString);
      cookieID = cookieParser.signedCookie(
        cookies[Constants.SESSION_COOKIE_NAME],
        Constants.SESSION_COOKIE_SECRET
      );
    } else if (req.sessionID) {
      cookieID = req.sessionID;
    } else {
      if (Sessions.classLogger) {
        Sessions.classLogger.info('sessions_getidfromcookie_no_cookie_found');
      }
      cookieID = false;
    }

    return cookieID;
  }

  getSessionCount() {
    return Object.keys(this._data).length;
  }

  maxSessionCountReached() {
    return Object.keys(this._data).length >= this.maxSessionCount;
  }

  deleteOldestInactiveSession() {
    let minTime = Date.now();
    let oldestSession = '';
    // find the session in this.app.sessions with oldest lastActive
    Object.keys(this._data)
      .map((key) => {
        const { lastActive } = this._data[key];
        if (lastActive && lastActive < minTime) {
          oldestSession = key;
          minTime = lastActive;
        }
        return Infinity;
      });

    // if lastActive > inactiveDurationSec, evict that session and continue else return error to user
    const lastActiveDurationSec = (Date.now() - minTime) / 1000;
    if (oldestSession && (lastActiveDurationSec >= this.inactiveDurationSec)) {
      this.logger.info('sessions_deleting_oldest_inactive_session', { sessionid: oldestSession });
      delete this._data[oldestSession];
      return true;
    }
    return false;
  }

  exists(req) {
    const cookieID = Sessions.getIdFromCookie(req);
    return !!this._data[cookieID];
  }

  initialize(req, id) {
    const cookieID = Sessions.getIdFromCookie(req);
    const sessionData = this._data[cookieID] || {};
    this._data[cookieID] = Object.assign(sessionData, {
      id
    });
  }

  delete(req) {
    const cookieID = Sessions.getIdFromCookie(req);
    delete this._data[cookieID];
  }

  _get(req, property) {
    const cookieID = Sessions.getIdFromCookie(req);
    const sessionData = this._data[cookieID] || {};
    if (Sessions.classLogger) {
      Sessions.classLogger.trace('sessions_get', { property, value: sessionData[property] });
    }
    return sessionData[property];
  }

  _set(req, property, value) {
    const cookieID = Sessions.getIdFromCookie(req);
    const sessionData = this._data[cookieID] || {};
    sessionData[property] = value;
    if (Sessions.classLogger) {
      Sessions.classLogger.trace('sessions_set', { property, value: sessionData[property] });
    }
    return sessionData[property];
  }

  getLastActive(req) { return this._get(req, 'lastActive'); }
  setLastActive(req, value) { return this._set(req, 'lastActive', value); }
  getClientId(req) { return this._get(req, 'clientId'); }
  setClientId(req, value) { return this._set(req, 'clientId', value); }
  getAppId(req) { return this._get(req, 'appId'); }
  setAppId(req, value) { return this._set(req, 'appId', value); }
  getAccountId(req) { return this._get(req, 'accountId'); }
  setAccountId(req) { return this._set(req, 'accountId'); }
  getClientApps(req) { return this._get(req, 'clientApps'); }
  setClientApps(req, value) { return this._set(req, 'clientApps', value); }

  setProperties(req, data) {
    // lastActive is for internal usage, others are client-facing
    const supportedProperties = ['clientId', 'appId', 'accountId', 'clientApps'];
    if (typeof data === 'object') {
      Object.keys(data).forEach((property) => {
        if (supportedProperties.includes(property)) {
          this._set(req, property, data[property]);
        } else if (Sessions.classLogger) {
          Sessions.classLogger.info('sessions_setproperties_property_not_supported', { property });
        }
      });
    } else if (Sessions.classLogger) {
      Sessions.classLogger.info('sessions_setproperties_argtype_not_object', { argtype: typeof data });
    }
  }
}

Sessions.classLogger = null;

module.exports = Sessions;
