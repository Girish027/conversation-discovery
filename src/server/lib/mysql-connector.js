/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const Assert = require('node-assert'),
  mysql = require('mysql'),
  util = require('util'),
  constants = require('./constants');

const CONFIG_KEY = constants;

class mysqlConnector {
  constructor(opts) {
    Assert.isObject(opts.config, 'opts.config');
    Assert.isObject(opts.logger, 'opts.logger');
    this._config = opts.config;
    this._logger = opts.logger;
    this._initialize = false;
  }

  /**
   * Initialize the database connection
   */
  async initialize() {
    const host = this._config.get(CONFIG_KEY.MYSQL_HOST);
    const user = this._config.get(CONFIG_KEY.MYSQL_USER);
    const password = this._config.get(CONFIG_KEY.MYSQL_PASSWORD);
    const port = this._config.get(CONFIG_KEY.MYSQL_PORT);
    const database = this._config.get(CONFIG_KEY.MYSQL_DATABASE);
    const connectionLimit = this._config.get(CONFIG_KEY.MYSQL_CONNECTION_LIMIT);
    Assert.notEmpty(host, 'mysqlHostname');
    Assert.notEmpty(user, 'mysqlUsername');
    Assert.notEmpty(database, 'mysqlDatabase');

    this._pool = mysql.createPool({
      connectionLimit,
      host,
      user,
      password,
      database,
      port
    });

    this._logger.info(`Trying to establish connection to MYSQL with host
      ${host} and user ${user}`);
    // Test connection
    if (!this._pool) {
      this._logger.error('Can not connect to mysql database');
      throw new Error('Could not connect to Mysql database');
    }

    try {
      this._pool.getConnection = util.promisify(this._pool.getConnection);
      const connection = await this._pool.getConnection();
      if (connection) {
        this._pool.query = util.promisify(this._pool.query);
        this._logger.info('Database connection successful');
        connection.release();
        this._initialize = true;
      }
    } catch (err) {
      this._logger.error('Can not connect to mysql database', {
        host,
        database,
        user,
        err
      });
      throw new Error(`Couldn't connect to Mysql database: ${err}`);
    }
  }

  /**
   * Execute query
   * @param {query} query SQL query
   */
  async executeQuery(query) {
    if (!this._initialize) {
      this._logger.error('Database not initialized, Can\'t execute query');
      throw new Error('Database not initialized');
    }

    this._logger.debug(`Executing query ${query}`);
    const result = await this._pool.query(query);
    return result;
  }

  async getConnectionForTransactions() {
    if (!this._initialize) {
      this._logger.error('Database not initialized, Can\'t execute query');
      throw new Error('Database not initialized');
    }

    try {
      const connection = await this._pool.getConnection();
      if (connection) {
        connection.beginTransaction = util.promisify(connection.beginTransaction);
        connection.query = util.promisify(connection.query);
        connection.commit = util.promisify(connection.commit);
        connection.rollback = util.promisify(connection.rollback);
        return connection;
      }
    } catch (err) {
      this._logger.error(`getConnectionForTransactions - ${err.message}`);
      throw err;
    }
    return null;
  }

  getPool() {
    if (!this._initialize) {
      this._logger.error('Database not initialized, Can\'t execute query');
      throw new Error('Database not initialized');
    }
    return this._pool;
  }
}

module.exports = mysqlConnector;
