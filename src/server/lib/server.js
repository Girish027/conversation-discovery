/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const Assert = require('node-assert');
const axios = require('axios');
const cors = require('cors');
const libPath = require('path');
const { BaseObject } = require('node-baseobject');
const express = require('express');
const bodyParser = require('body-parser');
const { parse } = require('url');
const fs = require('fs');
const libCorr = require('node-service-correlators');
const swaggerTools = require('swagger-tools-wrapper');
const { RequestLogger } = require('node-requestlogger');
const { SessionLogger } = require('node-sessionlogger');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const MemoryStore = require('memorystore')(session);
const { ExpressOIDC } = require('@okta/oidc-middleware');
const Issuer = require('openid-client').Issuer;
const uuidv4 = require('uuid/v4');
const aivaAppsConfig = require('aiva-apps-configs/appsConfigs');
const Constants = require('./constants');
const swaggerDoc = require('../api/swagger.json');
const Sessions = require('./sessions');
const MySQLStore = require('express-mysql-session')(session);
const ObjectUtils = require('./utils/object-utils');
const AxiosUtils = require('./utils/axios-utils');
const RoleUtils = require('./utils/role-utils');
const cookieParser = require('cookie-parser');
const { ingestClusterDataAndUpdateStatus } = require('../controllers/clusters');
const { updateRunStatusAndResultURL } = require('../controllers/runs');
const { createSystemProject } = require('../controllers/system-project-management');

const libUtil = {
  makeNonCacheable: (resp) => {
    return resp.set('Expires', 0)
      .set('Cache-Control', 'no-store, no-cache, must-revalidate')
      .set('Pragma', 'no-cache');
  },
  getBareContentType: (req) => {
    let ctype = req.get('content-type');
    if (ctype) {
      const RX_CONTENTTYPE_DELIM = /\s*;\s*/;
      ctype = ctype.split(RX_CONTENTTYPE_DELIM)[0];
    }
    return ctype;
  },

  readVersion: () => {
    const manifestPath = libPath.resolve(`${__dirname}/../../../package.json`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return manifest.version;
  }
};

/**
 * The server
 * @class
 * @param {object} opts Options for creating the server
 * @memberof module:server
 */
class Server extends BaseObject {
  constructor(opts) {
    Assert.isObject(opts, 'opts');
    Assert.isObject(opts.config, 'opts.config');
    Assert.isObject(opts.logmgr, 'opts.logmgr');

    super(opts.logmgr, 'SRVR');

    this._config = opts.config;
    this._logmgr = opts.logmgr;

    this.listenPort = Number(process.env.LISTEN_PORT || this._config.get(Constants.LISTEN_PORT_CONFIG_KEY));
    Assert.isNumber(this.listenPort, Constants.LISTEN_PORT_CONFIG_KEY);

    this.keepAliveTimeout = this._config.get(Constants.KEEPALIVE_TIMEOUT_CONFIG_KEY);
    if (this.keepAliveTimeout !== undefined) {
      Assert.isNumberInclusive(this.keepAliveTimeout, Constants.KEEPALIVE_TIMEOUT_CONFIG_KEY, 0);
    }

    this._version = libUtil.readVersion();

    this.isAuthOn = this._config.get(Constants.IS_SECURITY_ENABLED);
    this._heartbeatPath = this._config.get(Constants.HEARTBEAT_PATH_CONFIG_KEY);
    Assert.notEmpty(this._heartbeatPath, Constants.HEARTBEAT_PATH_CONFIG_KEY);
    this.info('health check', { path: this._heartbeatPath });

    this._inactiveDurationSec = this._config.get(Constants.INACTIVE_DURATION_SEC);
    this._maxSessionCount = this._config.get(Constants.MAX_SESSION_COUNT);

    this._server = undefined;
    this.app = express();

    this.app.locals._config = this._config;

    // alive means service has started running and hasn't been closed yet
    this._alive = undefined;

    this.app.locals.logger = this;

    this.app.disable(Constants.X_POWERED_BY);

    // OMNI-418: typical dynamic servers won't 304 an I-N-M
    // if your service can validate an I-N-M, remove this
    this.app.set('etag', false);
    this.app.set('cfdQueryObj', {});

    this.app.set('sessionsOptions', {
      inactive: process.env.SESSIONS_MAXINACTIVE || this._inactiveDurationSec,
      maxCount: process.env.SESSIONS_MAXCOUNT || this._maxSessionCount,
      logger: this.logger
    });

    this.app.locals._isTest = opts.isTest;
    this._configureMiddlewareAndRoutes(() => {
      this.run();
    });
  }

  /**
   * Starts the server's HTTP listener(s)
  */
  run(port) {
    this._alive = true;

    this._server = this.app.listen(port || this.listenPort, () => {
      this.info('listening', {
        port: this._server.address().port,
        version: this._version,
        env: this.app.get('env'),
        keepAliveTimeout: this._server.keepAliveTimeout
      });

      this.emit('listening', { httpServer: this._server });
    });

    if (this.keepAliveTimeout !== undefined) {
      this._server.keepAliveTimeout = this.keepAliveTimeout;
    }

    this._server.once('close', () => {
      this.emit('close');
    });
  }

  isAlive() {
    return this._alive;
  }

  async _configureMiddlewareAndRoutes(initCallback) {
    /**
    * Setup MySQLConnector connection and initialize
    */
    this.info('Server:initialize; Setting up middlewares');
    const app = this.app;
    app.get('/v1/health', (req, res) => {
      fs.stat(this._heartbeatPath, (err) => {
        libUtil.makeNonCacheable(res).set(Constants.X_SERVICE_VERSION_HEADER, this._version);
        if (err) {
          res.status(404).end();
        } else {
          res.set('Content-Type', 'text/plain').end('OK');
        }
      });
    });

    app.sessions = new Sessions(app.get('sessionsOptions'));

    this._setupRequestLogger();

    const allowedHostnamesRegex = /^localhost$|\.247-inc\.net$/;
    const corsOptions = {
      origin: (origin, callback) => {
        let found = false;
        if (origin) {
          const originUrl = parse(origin);
          if (originUrl) {
            const originHostname = originUrl.hostname;
            found = allowedHostnamesRegex.test(originHostname);
          } else {
            this.logger.error('server_cors_parse_error', { origin });
          }
        }

        if (found || typeof origin === 'undefined') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,POST',
      preflightContinue: false,
      optionsSuccessStatus: 204
    }

    app.use(cors(corsOptions));
    app.use(multer({ dest: this._config.get(Constants.UPLOAD_BASE_PATH) }).any());
    app.use(helmet());
    /*eslint quotes: ["error", "single", { "avoidEscape": true }]*/
    app.use(helmet.contentSecurityPolicy({
      directives: {
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'localhost:*',
          '*.247-inc.net',
          'https://www.gstatic.com',
          'https://d1af033869koo7.cloudfront.net',
          'https://fonts.googleapis.com',
          'blob:'
        ],
        connectSrc: [
          "'self'",
          'https://d1af033869koo7.cloudfront.net',
          'localhost:*',
          '*.247-inc.net',
          'https://247-inc.oktapreview.com',
          'https://sso-247-inc.oktapreview.com',
          'https://247-inc.okta.com',
          'https://sso-247-inc.okta.com',
          'https://api.amplitude.com/',
          'https://login.247ai.com/',
          'https://login.247.ai'
        ]
      }
    }));
    // generate session id
    app.use(libCorr.addTransactionId);
    app.use(bodyParser.urlencoded({ extended: false }));
    // TODO: only install this if your real API consumes json
    app.use(bodyParser.json());

    // log cross-service correlators
    app.use(libCorr.log.bind(this));
    // For parsing cookies
    // app.use(express.cookieParser());
    app.use(cookieParser())

    /*
     * Install a per-request logger that injects current transaction/session id
     * into the metadata of each log event
     */
    app.use((req, res, next) => {
      req.logger = new SessionLogger({ logmgr: this._logmgr, request: req, logregion: 'CDT' });
      req.app.configs = this._config;
      next();
    });

    const mySqlStoreOptions = {
      host: this._config.get(Constants.MYSQL_HOST),
      port: this._config.get(Constants.MYSQL_PORT),
      user: this._config.get(Constants.MYSQL_USER),
      password: this._config.get(Constants.MYSQL_PASSWORD),
      database: this._config.get(Constants.MYSQL_DATABASE)
    };

    let myStore;

    if (this.app.locals._isTest) {
      this.logger.info('Test call - ' + this.app.locals._isTest);
      myStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    } else {
      this.logger.info('NOT a Test call - ' + this.app.locals._isTest);
      myStore = new MySQLStore(mySqlStoreOptions);
    }

    // attaches cookie to req
    // cookie only contains an ID that points to session data
    // but all session data lives on the express server in memory
    let sess = {
      name: Constants.SESSION_COOKIE_NAME,
      secret: Constants.SESSION_COOKIE_SECRET,
      resave: true,
      saveUninitialized: true,
      store: myStore,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60 * 1000 // one hour
      }
    };

    //  Uncomment only if the port of LB is not on HTTPS to listen requests from APIGEE
    //  if (app.get('env') !== 'development') {
    //    app.set('trust proxy', 1); // allow session:cookie:secure=true to work behind (Apigee) proxy
    //    sess.cookie.secure = true; // serve secure cookies
    //  }

    app.use(session(sess));

    Issuer.useRequest();

    app.use((req, res, next) => {
      if (!req.app.sessions.exists(req)) {
        this.logger.info('no server session');
        const sessionid = uuidv4();
        const cookieid = Sessions.getIdFromCookie(req);
        this.logger.info('server_session_init', { sessionid, cookieid, route: 'middleware' });
        req.app.sessions = new Sessions(req.app.get('sessionsOptions'));
        req.app.sessions.initialize(req, sessionid);
      }
      req.app.sessions.setLastActive(req, req._startTime.getTime());
      next();
    });

    // its navigation uses query parameters, which are ignored by some caches
    // see https://gtmetrix.com/remove-query-strings-from-static-resources.html
    // to support its navigation, instruct the web browser to not cache any response
    app.use((req, res, next) => {
      this.logger.info('cd test', { route: 'middleware' });
      if (/conversation-discovery/.test(req.url)) {
        libUtil.makeNonCacheable(res).set(Constants.X_SERVICE_VERSION_HEADER, this._version);
      }
      next();
    });

    app.use(`${swaggerDoc.basePath}/trusted/*`, async (req, res, next) => {
      const isInternalCall = req.headers[Constants.X_TFS_INTERNALPROXYCALL];
      if (isInternalCall || req.headers.host === this._config.get(Constants.LOCALHOST)) {
        req.logger = this.logger;
        this.logger.info('Trusted Flow!');
        next();
      }
      else {
        this.logger.info('Access Denied!! not the trusted flow!');
        res.status(401);
        res.send('Access Denied!! not the trusted flow!');
      }
    });

    app.route(`${swaggerDoc.basePath}/trusted/clients/:clientId/accounts/:accountId/applications/:applicationId/projects/:projectId/runs/:runId/status`)
      .patch((req, res) => {
        updateRunStatusAndResultURL(req, res);
      });

    app.route(`${swaggerDoc.basePath}/trusted/clients/:clientId/accounts/:accountId/applications/:applicationId/projects/:projectId/runs/:runId/ingesttoes`)
      .patch((req, res) => {
        ingestClusterDataAndUpdateStatus(req, res);
      });

    app.route(`${swaggerDoc.basePath}/trusted/clients/:clientId/accounts/:accountId/applications/:applicationId/systemprojects`)
      .post((req, res) => {
        createSystemProject(req, res);
      });

    if (this.isAuthOn) {
      this.logger.info('server_okta_enabled');

      let oidc = new ExpressOIDC({
        issuer: this._config.get(Constants.ISSUER),
        client_id: this._config.get(Constants.CLIENT_ID),
        client_secret: this._config.get(Constants.CLIENT_SECRET),
        redirect_uri: this._config.get(Constants.REDIRECT_URI),
        scope: this._config.get(Constants.SCOPE),
        routes: {
          login: {
            path: `${swaggerDoc.basePath}/login`
          },
          callback: {
            path: `${swaggerDoc.basePath}/authorization-code/callback`
          }
        }
      });

      this._oidc = oidc;
      oidc.on('error', (err) => {
        this.error('app_start_oidc_config_error', { reason: err.message });
        throw new Error('Issue with security config');
      });

      oidc.on('ready', () => {
        this.info('Server:initialize; app_start_oidc_ready');
        initCallback();
      });

      // ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
      app.use(oidc.router);
      app.use((req, res, next) => {
        if (!req.isAuthenticated()) {
          this.logger.info('server_login_attempted',
            { cookieid: Sessions.getIdFromCookie(req) });
        }
        next();
      });
      app.use(oidc.ensureAuthenticated());
    } else {
      this.logger.info('server_okta_disabled');
    }

    app.get(`${swaggerDoc.basePath}`, (req, res, next) => {
      if (req.query && Object.keys(req.query).length !== 0) {
        // usage: query parameters in redirect
        // race condition:
        // 1) save query parameters to global cfdQueryObj
        // 2) consume in applications controller
        // cookie id changes between steps 1 and 2, so cannot use express session
        const { clientid, appid } = req.query;
        this.logger.info('Query ' + JSON.stringify(req.query));
        app.set('cfdQueryObj', { clientid, appid });
        this.logger.info('server_login_attempted', { cookieid: Sessions.getIdFromCookie(req) });
        return res.redirect(301, `${swaggerDoc.basePath}/`);
      }
      next();
    });

    app.use((req, res, next) => {
      if (!req.hasOwnProperty('userContext')) {
        req.userContext = { userinfo: { groups: [], clients: [] } };
      }
      next();
    });

    app.use((req, res, next) => {
      if (/^[a-zA-Z0-9._\\/-]+$/.test(req.path) && !req.path.includes('./')) {
        next();
      } else {
        res.status(400).send('invalid characters in path');
      }
    });

    app.use(express.static(libPath.join(__dirname, '../../../dist')));

    app.get(`${swaggerDoc.basePath}/ui/*`, function (req, res) {
      res.sendFile(libPath.join(__dirname, '../../../dist/conversationdiscovery/index.html'));
    });

    app.get(`${swaggerDoc.basePath}/logout`, (req, res) => {
      // log cookieID for a logout attempt
      if (req.isAuthenticated()) {
        this.logger.info('server_logout_attempted',
          { cookieid: Sessions.getIdFromCookie(req) });
      }
      req.app.sessions.delete(req);
      req.logout();
      req.session.destroy();
      res.redirect(`${swaggerDoc.basePath}`);
    });

    app.get(`${swaggerDoc.basePath}/user/config`, async (req, res, next) => {
      const { clientid, appid } = app.get('cfdQueryObj');
      app.set('cfdQueryObj', {});
      const { username, userType } = await Server.getUsernameAndUserType(req);
      let contactSupportUrl;
      if (userType === 'External') {
        contactSupportUrl = this._config.get(Constants.CONTACT_SUPPORT_URL_EXTERNAL);
      } else {
        contactSupportUrl = this._config.get(Constants.CONTACT_SUPPORT_URL_INTERNAL);
      }
      let userClientConfigsRes = {};
      try {
        if (this._config.get(Constants.IS_SECURITY_ENABLED)) {
          userClientConfigsRes = await this.getClientConfigs(req);
        } else {
          userClientConfigsRes = aivaAppsConfig;
        }
        res.send({
          authEnabled: this._config.get(Constants.IS_SECURITY_ENABLED),
          itsBaseUrl: this._config.get(Constants.ITS_BASE_URL),
          analyticsKey: this._config.get(Constants.ANALYTICSKEY_CONFIG_KEY),
          clientConfigs: userClientConfigsRes,
          username,
          userType,
          clientId: clientid || 'tfsai',
          appId: appid || 'referencebot',
          componentClientId: '247ai',
          unifiedPortalUrl: this._config.get(Constants.UNIFIED_PORTAL_URL),
          docPortalUrl: this._config.get(Constants.IDT_DOC_PORTAL_URL),
          contactSupportUrl,
          oktaUserAccountUrl: this._config.get(Constants.OKTA_ACCOUNT_URL)
        });
      } catch (err) {
        // throw the error to express
        next(err);
      }
    });

    app.get(`${swaggerDoc.basePath}/user/conversationsConfig`, async (req, res, next) => {
      const { userContext } = req;
      if (userContext && userContext.userinfo) {
        this.logger.info('User Name: ' + userContext.userinfo.name + '| User email: ' + userContext.userinfo.email);
      }
      try {
        let userConversationsClientConfigsRes = {};
        if (this._config.get(Constants.IS_SECURITY_ENABLED)) {
          const userId = userContext.userinfo.sub;
          const fetchConversationsId = this._config.get(Constants.FETCH_CLIENT_CONVERSATIONS);
          const getConversationsClientConfigsUrl = `${this._config.get(Constants.ITS_API_URL)}clients?userid=${userId}&product=${fetchConversationsId}`;
          const axiosConversationsConfig = {
            userid: userId,
            product: fetchConversationsId,
            headers: {
              accept: 'application/json'
            }
          };
          this.logger.debug('getConversationsClientConfigs', { getConversationsClientConfigsUrl, axiosConversationsConfig });
          // Adding n number of retries in case of failure. n - is defined inside interceptor.
          AxiosUtils.addRetryInterceptor(axios, this.logger);
          userConversationsClientConfigsRes = await axios.get(getConversationsClientConfigsUrl, axiosConversationsConfig);
          this.logger.debug('getConversationsClientConfigs', { userConversationsClientConfigsRes });
        } else {
          userConversationsClientConfigsRes = aivaAppsConfig;
        }
        res.send({
          clientConfigs: userConversationsClientConfigsRes.data,
        });
      } catch (err) {
        // throw the error to express
        next(err);
      }
    });

    app.get(`${swaggerDoc.basePath}/user/answersConfig`, async (req, res, next) => {
      const { userContext } = req;
      if (userContext && userContext.userinfo) {
        this.logger.info('User Name: ' + userContext.userinfo.name + '| User email: ' + userContext.userinfo.email);
      }
      try {
        let userAnswersClientConfigsRes = {};
        if (this._config.get(Constants.IS_SECURITY_ENABLED)) {
          const userId = userContext.userinfo.sub;
          const fetchAnswersId = this._config.get(Constants.FETCH_CLIENT_ANSWERS);
          const getAnswersClientConfigsUrl = `${this._config.get(Constants.ITS_API_URL)}clients?userid=${userId}&product=${fetchAnswersId}`;
          const axiosAnswersConfig = {
            userid: userId,
            product: fetchAnswersId,
            headers: {
              accept: 'application/json'
            }
          };
          this.logger.debug('getAnswersClientConfigs', { getAnswersClientConfigsUrl, axiosAnswersConfig });
          // Adding n number of retries in case of failure. n - is defined inside interceptor.
          AxiosUtils.addRetryInterceptor(axios, this.logger);
          userAnswersClientConfigsRes = await axios.get(getAnswersClientConfigsUrl, axiosAnswersConfig);
          this.logger.debug('getAnswersClientConfigs', { userAnswersClientConfigsRes });
        } else {
          userAnswersClientConfigsRes = aivaAppsConfig;
        }
        res.send({
          clientConfigs: userAnswersClientConfigsRes.data,
        });
      } catch (err) {
        // throw the error to express
        next(err);
      }
    });

    app.post('*', (req, res, next) => {
      // swagger forces us to pick one of formData or query
      // allow query params to override the body
      // this facilitates convenient linking behavior
      const qlen = Object.keys(req.query);
      if (qlen.length === 0) {
        next();
        return;
      }

      let doMerge = false;
      const ctype = libUtil.getBareContentType(req);
      if (!ctype) {
        req.headers['content-type'] = Constants.MIME_APP_URLENCODED;
        doMerge = true;
      } else if (ctype === Constants.MIME_APP_URLENCODED) {
        doMerge = true;
      }

      if (doMerge) {
        Object.assign(req.body, req.query);
      }

      next();
    });

    app.get(`${swaggerDoc.basePath}/sessions`, (req, res) => {
      const cfdQueryObj = req.app.get('cfdQueryObj');
      req.app.set('cfdQueryObj', {});

      let clientId = cfdQueryObj.clientid;
      let appId = cfdQueryObj.appid;

      if (!clientId || !appId) {
        clientId = req.app.sessions.getClientId(req) || '247ai';
        appId = req.app.sessions.getAppId(req) || 'referencebot';
      }
      return res.sendStatus(400);
    });

    app.post(`${swaggerDoc.basePath}/sessions`, (req, res) => {
      // clientid and appid should be saved in session data
      req.app.sessions.setProperties(req, req.body);
      res.status(201).end();
    });

    this._setupSwagger();

    // Authorization on every API call
    app.use(`${swaggerDoc.basePath}/clients/:clientId/accounts/:accountId/applications/:applicationId/*`, async (req, res, next) => {
      const { sessions } = req.app;
      const { clientId, accountId, applicationId } = req.params;
      this.setCookies(res, { clientId, accountId, appId: applicationId }, this._config.get(Constants.COOKIES_EXPIRES));
      if (this._config.get(Constants.AUTHORIZATION_ENABLED)) {
        const { clientId, accountId, applicationId } = req.params;
        //For logging purpose getting the username and userType
        const { username, userType } = Server.getUsernameAndUserType(req);
        let userClientConfigsRes = sessions.getClientApps(req);
        try {
          if (!userClientConfigsRes) {
            userClientConfigsRes = await this.getClientConfigs(req);
          }
          if (!this.matchFound(userClientConfigsRes, { clientId, accountId, appId: applicationId })) {
            this.logger.error(`${username}  ${userType} unauthorized`);
            res.status(401).end(Constants.HTTP_ERROR.USER_IS_UNAUTHORIZED);
            next(new Error(Constants.HTTP_ERROR.USER_IS_UNAUTHORIZED));
            return;
          }
          if (this.roleRestriction(userClientConfigsRes, clientId, req)) {
            res.status(403).end(Constants.ERRORS.FORBIDDEN);
            next(new Error(Constants.ERRORS.FORBIDDEN));
            return;
          }
          this.setCookies(res, { clientId, accountId, appId: applicationId }, this._config.get(Constants.COOKIES_EXPIRES));
        } catch (err) {
          this.logger.error('Unable to get users client configs');
          res.status(500).json(Constants.HTTP_ERROR.INTERNAL_SERVER_ERROR);
          // throw the error to express
          next(err);
        }
      }
      next();
    });
    if (!this.isAuthOn) {
      initCallback();
    }
  }
  /*
  Cookies are set here/
  Need to set cookies always, since the user can change the clientId/appId/accountId via url.
   */
  async setCookies(res, clientAppAccount, cookieExpires) {
    res.cookie('client', clientAppAccount.clientId, { maxAge: cookieExpires });
    res.cookie('account', clientAppAccount.accountId, { maxAge: cookieExpires });
    res.cookie('app', clientAppAccount.appId, { maxAge: cookieExpires });
    this.logger.info('Successfully set the cookies');
  }

  async getClientConfigs(req) {
    const { userContext } = req;

    if (userContext && userContext.userinfo) {
      this.logger.info('User Name: ' + userContext.userinfo.name + '| User email: ' + userContext.userinfo.email);
    }

    let userClientConfigsRes = {};
    const userId = userContext.userinfo.sub;
    const fetchProductId = this._config.get(Constants.FETCH_CLIENT_PRODUCT);
    const getClientConfigsUrl = `${this._config.get(Constants.ITS_API_URL)}clients?userid=${userId}&product=${fetchProductId}`;

    try {
      const axiosConfig = {
        userid: userId,
        product: fetchProductId,
        headers: {
          accept: 'application/json'
        }
      };
      this.logger.debug('getClientConfigs', { getClientConfigsUrl, axiosConfig });
      // Adding n number of retries in case of failure. n - is defined inside interceptor.
      AxiosUtils.addRetryInterceptor(axios, this.logger);
      userClientConfigsRes = await axios.get(getClientConfigsUrl, axiosConfig);
      this.logger.debug('getClientConfigs', { userClientConfigsRes });
      if (userClientConfigsRes && userClientConfigsRes.data) {
        req.app.sessions.setClientApps(req, userClientConfigsRes.data);
        req.app.locals.clientApps = userClientConfigsRes.data;
      }
    } catch (err) {
      this.logger.error('getClientConfigs', {
        getClientConfigsUrl,
        err: err.message,
        message: 'fail to fetch error config'
      });
      throw err;
    }
    return this.getAuthInfo(userClientConfigsRes.data);
  }

  async getAuthInfo(userClientConfigsData) {
    return userClientConfigsData.map((element) => {
      const { accounts } = element;
      let role = Constants.roles.viewer; // default role is viewer
      if ( accounts ) {
        for (let index in accounts) {
          const { products } = accounts[index];
          if (products) {
            for (let index in products) {
              const { roles } = products[index];
              if (roles) {
                for (let index in roles) {
                  role = RoleUtils.getHigherRole(role, roles[index]);
                }
              }
            }
          }
        }
      }
      element.role = role;
      return element;
    });
  }

  static async getUsernameAndUserType(req) {
    let username = 'UNKNOWN',
      userType = Constants.ANALYTICS_EXTERNAL_USER;

    if (req.isAuthenticated() && req.userContext.userinfo) {
      const { name, email, tfsUserType } = req.userContext.userinfo;
      username = name;
      if (tfsUserType && (tfsUserType.toUpperCase() === Constants.ANALYTICS_INTERNAL_USER.toUpperCase()) && (/@(247-inc\.(net|com)|247\.ai)$/.test(email))) {
        userType = Constants.ANALYTICS_INTERNAL_USER;
      }
    }

    const userDetails = { username, userType };
    return userDetails;
  }

  /**
   * Terminates the server
   * @param  {string} [reason] The reason for termination
   */
  close(reason) {
    if (!this._alive) {
      /* eslint-disable no-console */
      console.log('The process might still be alive due to open TCP connections. Committing suicide...');
      /* eslint-enable no-console */
      process.exit(1);
    }

    this.info(`Shutting down due to ${reason}...`);
    this._alive = false;
    if (this._requestLogger) {
      this._server.once('close', this._shutdownRequestLogger.bind(this));
    }
    this._server.close();
  }

  /* eslint-disable class-methods-use-this */
  toString() {
    return '';
  }
  /* eslint-enable class-methods-use-this */

  _setupRequestLogger() {
    let logDir = this._config.get(Constants.REQUEST_LOG_CONFIG_KEY);
    if (!logDir) {
      this.info(`request logs are not enabled. Missing ${Constants.REQUEST_LOG_CONFIG_KEY}`);
      return;
    }

    logDir = libPath.resolve(logDir);

    const flushInterval = this._config.get(Constants.REQUEST_LOG_FLUSHINTERVAL_CONFIG_KEY);

    this._requestLogger = new RequestLogger({
      basePath: logDir,
      serviceName: Constants.SERVICE_NAME,
      logger: this,
      flushInterval
    });

    this.app.use(this._requestLogger.getMiddleware());

    this._reopenRequestLogger = () => {
      this._requestLogger.reopen();
    };
    process.on('SIGUSR2', this._reopenRequestLogger);
  }

  async _setupDataStore(dataLayer) {
    this.info('Server:initialize; Initializing mysql data store');
    this.app.locals.db = dataLayer;
    this.info('Server:initialize; Initialized mysql data store');
  }

  async _setupRedisCeleryQueue(redisClient) {
    this.info('Server:initialize; Initializing redis celery queue');
    this.app.locals.celery = redisClient;
    this.info('Server:initialize; Initialized redis celery queue');
  }

  async _setupESDataStore(esDataLayer) {
    this.info('Server:initialize; Initializing Elastic Search data store');
    this.app.locals.es = esDataLayer;
    this.info('Server:initialize; Initialized Elastic Search data store');
  }

  async _setupGcpDataStore(gcpDataStore) {
    this.info('Server:initialize; Initializing gcp data store');
    this.app.locals.gcpdb = gcpDataStore;
    this.info('Server:initialize; Initialized gcp data store');
  }

  _shutdownRequestLogger() {
    this._requestLogger.close();
    process.removeListener('SIGUSR2', this._reopenRequestLogger);
  }

  _setupSwagger() {
    const app = this.app;
    swaggerTools.initializeMiddleware(app,
      swaggerDoc,
      `${__dirname}/../controllers`,
      () => {
        app.use(handleErrors.bind(this));
      },
      {
        trimOptions: { maxDepth: 2 }
      }
    );
  }

  roleRestriction(userClientConfigsRes, clientId, req) {
    let restrict = true;
    let role, clientObj;
    let method = req.method;
    let allowedRoles = [Constants.roles.developer, Constants.roles.tester,
       Constants.roles.internaladmin, Constants.roles.operator, Constants.roles.admin];
    if (!ObjectUtils.isUndefinedOrNull(userClientConfigsRes)) {
      clientObj = (userClientConfigsRes.find(o => o.componentClientId === clientId));
      role = clientObj.role;
    }
    if ((allowedRoles.includes(role)) || ((role === Constants.roles.viewer) && (Constants.viewer.includes(method)))) {
      restrict = false;
    }
      return restrict;
  }

  matchFound(authorizedClientIds, clientIdAccountAppId) {
    let match = false;
    if (!ObjectUtils.isUndefinedOrNull(authorizedClientIds)) {
      for (let i in authorizedClientIds) {
        const clientApps = authorizedClientIds[i];
        if (clientApps.componentClientId === clientIdAccountAppId.clientId) {
          for (let j in clientApps.apps) {
            if (clientApps.apps[j].appId === clientIdAccountAppId.appId &&
              clientApps.apps[j].accountId === clientIdAccountAppId.accountId) {
              match = true;
              break;
            }
          }
        }
        if (match) break;
      }
    }
    return match;
  }
}

// last resort error handler
// eslint-disable-next-line no-unused-vars
function handleErrors(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  const logger = req.logger || this;

  let code = res.statusCode;
  if (!code || code === 200) {
    code = err.code || err.status || err.statusCode || 500;
  }

  // avoid core node RangeError exception
  if (code > 999) {
    code = 500;
  }

  res.status(code);

  const logAttrs = {
    url: req.url,
    code,
    method: req.method
  };

  let publicError;
  if (code >= 500) {
    logAttrs.stack = err.stack;
    publicError = false;
    logger.error(err.message, logAttrs);
  } else {
    // body-parser detail, if any is in err.type
    logAttrs.detail = swaggerTools.getValidationErrorDetail(err) || err.type;
    publicError = true;
    logger.info(err.message, logAttrs);
  }

  // the actual error was logged above; scrub that message but inform the user
  if (!publicError) {
    err.message = 'We are investigating an internal error; try again.';
  }

  // if NOC datacenter failover, cookie from old datacenter is rejected
  if (code === 401) {
    let msg = err.message;
    msg = `${msg}; delete ${Constants.SESSION_COOKIE_NAME} cookie`;
    msg = `${msg} for ${req.headers.host}.`;
    err.message = msg;
  }

  res.format({
    'application/json': () => {
      const error = {
        code,
        reason: err.message
      };

      res.json(error);
    },
    default() {
      res.send(err.message);
    }
  });
}

/**
 * The server module
 * @module server
 */
module.exports = {
  Server
};
