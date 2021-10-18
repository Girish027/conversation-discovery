/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';
const Assert = require('node-assert'),
  { Client } = require('@elastic/elasticsearch'),
  constants = require('./constants'),
  es_cluster_schema = require('../../../elastic-search-schema/cluster-schema.json'),
  es_conversation_schema = require('../../../elastic-search-schema/conversation-schema.json');

const CONFIG_KEY = constants;
let logger;

const printOnDrop = (doc) => {
  logger.info(`Bulk ingest failed for doc : ${JSON.stringify(doc)} \n `);
}

class ESConnector {
  constructor(opts) {
    Assert.isObject(opts.config, 'opts.config');
    Assert.isObject(opts.logger, 'opts.logger');
    this._config = opts.config;
    this._logger = opts.logger;
    this._initialize = false;
    this.client = null;
    logger = opts.logger;
  }

  /**
   * Initialize the Elastic Search Server connection
   */
  async initialize() {
    const nodes = this._config.get(CONFIG_KEY.ES_NODE);
    const maxRetries = this._config.get(CONFIG_KEY.ES_MAXRETRIES);
    const requestTimeout = this._config.get(CONFIG_KEY.ES_REQUEST_TIMEOUT);
    const sniffOnStart = this._config.get(CONFIG_KEY.ES_SNIFF_ON_START);

    Assert.isNonEmptyArray(nodes, 'esHostname');

    this.client = new Client({
      nodes,
      maxRetries,
      requestTimeout,
      sniffOnStart
    });

    this._logger.info(`Trying to establish connection to Elastic Search with host ${nodes}`);
    // Create an index/mapping if it doesn't exist
    await this.createIndexIfNotExists();

    // Test connection
    if (!this.client) {
      this._logger.error('Can not connect to Elastic Search database');
      throw new Error('Could not connect to Elastic Search database');
    }
  }

  /**
   * Create a new index with mapping if it doesn't exist
   */
  async createIndexIfNotExists() {
    const clusterIndexExists = await this.client.indices.exists({
      index: this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX),
      local: false
    });
    if (!clusterIndexExists.body) {
      await this.client.indices.create({
        index: this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX),
        body: es_cluster_schema
      });
    }

    const conversationIndexExists = await this.client.indices.exists({
      index: this._config.get(CONFIG_KEY.ES_CONVERSATION_INDEX),
      local: false
    });
    if (!conversationIndexExists.body) {
      await this.client.indices.create({
        index: this._config.get(CONFIG_KEY.ES_CONVERSATION_INDEX),
        body: es_conversation_schema
      });
    }
  }

  async getClient() {
    return this.client;
  }

  async searchESData(query) {
    return await this.client.search(query);
  }

  async deleteESDataByClusterId(clusterIdList, index) {
    const queryEs = {
      index: this._config.get(index),
      body: {
        query: {
          terms: {
            cluster_id: clusterIdList
          }
        }
      }
    }
    return await this.client.deleteByQuery(queryEs);
  }

  async deleteESDataByRunId(runId, index) {
    const queryEs = {
      index: this._config.get(index),
      body: {
        query: {
          match: {
            run_id: runId
          }
        }
      }
    }
    return await this.client.deleteByQuery(queryEs);
  }

  async updateESData(query) {
    return await this.client.updateByQuery(query);
  }

  async bulkIngest(body) {
    return await this.client.bulk({
      refresh: true,
      body
    });
  }

  async bulkHelperIngest(dataset, indexName) {
    return await this.client.helpers.bulk({
      datasource: dataset,
      onDocument() {
        return {
          index: { _index: indexName }
        }
      },
      onDrop(doc) {
        printOnDrop(doc);
      },
      retries: 25,
      wait: 10000,
    });
  }
}

module.exports = ESConnector;
