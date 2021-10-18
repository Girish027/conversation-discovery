/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const fetchAllCluster = require('../queries/fetchAllCluster.json');
const fetchClusterConversations = require('../queries/fetchClusterConversations.json');
const fetchAllConversation = require('../queries/fetchAllConversation.json');
const updateCluster = require('../queries/updateCluster.json');
const updateConversation = require('../queries/updateConversation.json');
const constants = require('./constants');
const TAG = 'ESDataLayer';
const CONFIG_KEY = constants;

class ESDataLayer {
    constructor(connector, logger, config) {
        this._connector = connector;
        this._logger = logger;
        this._config = config;
        this.initialize();
    }

    async initialize() {
        // Initialize the DataLayer
        try {
            this._logger.info('Initializing DataLayer');
        } catch (err) {
            throw err;
        }
    }

    /**
     * POST data into the ES index
     * @param {obj} data
     */
    async postData(data) {
        this._logger.info(`${TAG}:postData: Loading the data into the ES Index ${data}`);
        //  TODO: Add the updated schema 
    }

    async getClusterConversations(client, account, app, projectId, runId, clusterId, search, similarity) {
        this._logger.info(`${TAG}:GET: Fetching conversations for client ${client}, account ${account}, app ${app}, project ${projectId}, run ${runId} and cluster ${clusterId}`);
        this._logger.info(`${TAG}:GET: Search keywoed: ${search}, similarity: ${similarity}`);

        var fetchCC = JSON.parse(JSON.stringify(fetchClusterConversations));

        fetchCC.index = this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX);
        var filters = fetchCC.body.query.bool.must[0].bool.must;
        for (var j in filters) {
            if (filters[j].term.project_id) {
                filters[j].term.project_id.value = projectId;
            }
            else if (filters[j].term.run_id) {
                filters[j].term.run_id.value = runId;
            }
            else if (filters[j].term.cluster_id) {
                filters[j].term.cluster_id.value = clusterId;
            }
        }

        if (search != undefined) {
            filters.push({
                match_bool_prefix: {
                    processed_body: search
                }
            });
        }

        if (similarity != undefined) {
            var sim = parseFloat(similarity);
            if (isNaN(sim)) {
                throw new Error(constants.ERRORS.NOT_A_NUMBER);
            }
            else {
                filters.push({
                    range: {
                        similarity: {
                            from: sim,
                            to: null,
                            include_lower: true,
                            include_upper: false,
                            boost: 1.0
                        }
                    }
                });
            }
        }

        const response = await this._connector.searchESData(fetchCC);
        var conversations = [];
        this._logger.debug('Query ' + JSON.stringify(fetchCC));

        if (!response) {
            this._logger.error(`${TAG}: Error while fetching conversation data from ES`);
        }
        else {
            this._logger.info(`${TAG}: Data fetch success`);
            this._logger.debug(JSON.stringify(response));
            if (response && response.body && response.body.hits && response.body.hits.hits) {
                var hits = response.body.hits.hits;
                for (var i in hits) {
                    conversations.push({
                        documentId: (hits[i]._id) ? hits[i]._id : '',
                        transcriptId: (hits[i].fields.interaction_id && hits[i].fields.interaction_id[0]) ? hits[i].fields.interaction_id[0] : '',
                        sentenceSet: (hits[i]._source.processed_body) ? hits[i]._source.processed_body : '',
                        assignedIntent: (hits[i]._source.assigned_intent) ? hits[i]._source.assigned_intent : '',
                        assignedFaq: (hits[i]._source.assigned_faq) ? hits[i]._source.assigned_faq : '',
                        originalSimilarity: (hits[i]._source.similarity) ? parseFloat(hits[i]._source.similarity) : 0,
                        originalCluster: (hits[i].fields.original_granular_intent && hits[i].fields.original_granular_intent[0]) ? hits[i].fields.original_granular_intent[0] : '', // all these will be same as there is no curation
                        previousCluster: '',
                        currentCluster: (hits[i].fields.entire_cluster_label && hits[i].fields.entire_cluster_label[0]) ? hits[i].fields.entire_cluster_label[0] : '',
                        modifiedBy: (hits[i].fields.modified_by && hits[i].fields.modified_by[0]) ? hits[i].fields.modified_by[0] : '',
                        modified: (hits[i]._source.modified_at) ? hits[i]._source.modified_at : 0
                    });
                }
            }
        }

        return conversations;
    }

    async getAllConversations(clusterId, interactionId) {
        this._logger.info(`${TAG}:GET: Fetching all conversations for cluster ${clusterId} and interaction ${interactionId}`);

        var fetchAllConv = JSON.parse(JSON.stringify(fetchAllConversation));
        fetchAllConv.index = this._config.get(CONFIG_KEY.ES_CONVERSATION_INDEX);
        var filters = fetchAllConv.body.query.bool.must;
        for (var j in filters) {
            if (filters[j].term.cluster_id) {
                filters[j].term.cluster_id.value = clusterId;
            }
            else if (filters[j].term.interaction_id) {
                filters[j].term.interaction_id.value = interactionId;
            }
        }

        const response = await this._connector.searchESData(fetchAllConv);
        var conversations = [];
        this._logger.debug('Query ' + JSON.stringify(fetchAllConv));

        if (!response) {
            this._logger.error(`${TAG}: Error while fetching all conversation data from ES`);
        }
        else {
            this._logger.info(`${TAG}: All conversation fetch successfully`);
            this._logger.debug(JSON.stringify(response));
            if (response && response.body && response.body.hits && response.body.hits.hits) {
                var hits = response.body.hits.hits;
                for (var i in hits) {
                    conversations.push({
                        documentId: (hits[i]._id) ? hits[i]._id : '',
                        clusterId: (hits[i].fields.cluster_id && hits[i].fields.cluster_id[0]) ? hits[i].fields.cluster_id[0] : '',
                        transcriptId: (hits[i].fields.interaction_id && hits[i].fields.interaction_id[0]) ? hits[i].fields.interaction_id[0] : '',
                        sentenceSet: (hits[i]._source.processed_body) ? hits[i]._source.processed_body : '',
                        sequence: (hits[i]._source.sequence) ? hits[i]._source.sequence : -1,
                        turn: (hits[i]._source.turn) ? hits[i]._source.turn : 0
                    });
                }
            }
        }

        return conversations;
    }

    /**
     * GET all cluster data from ES
     * @param client
     * @param account
     * @param app
     * @param projectId
     * @param runId
     * @returns {Promise.<void>}
     */
    async getAllClusterData(client, account, app, projectId, runId) {
        this._logger.info(`${TAG}:GET: Fetching cluster data for client ${client}, account ${account}, app ${app}, project ${projectId} and run ${runId}`);

        var fetchAllClusterCopy = JSON.parse(JSON.stringify(fetchAllCluster));
        fetchAllClusterCopy.index = this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX);
        var filters = fetchAllClusterCopy.body.query.bool.must[0].bool.must;
        for (var j in filters) {
            if (filters[j].term.project_id) {
                filters[j].term.project_id.value = projectId;
            }
            else if (filters[j].term.run_id) {
                filters[j].term.run_id.value = runId;
            }
        }

        const response = await this._connector.searchESData(fetchAllClusterCopy);
        var clusterData = [];

        if (!response) {
            this._logger.error(`${TAG}: Error while fetching cluster data from ES`);
        }
        else {
            this._logger.info(`${TAG}: Data fetch success`);
            if (response && response.body && response.body.aggregations
                && response.body.aggregations.groupby && response.body.aggregations.groupby.buckets) {
                var buckets = response.body.aggregations.groupby.buckets;
                for (var i in buckets) {
                    clusterData.push({
                        clusterId: (buckets[i].key.clusterId) ? buckets[i].key.clusterId : '',
                        clusterName: (buckets[i].key.granularIntent) ? buckets[i].key.granularIntent : '', // this is the one getting edited
                        originalName: (buckets[i].key.originalGranularIntent) ? buckets[i].key.originalGranularIntent : '',
                        wordCloudTerms: (buckets[i].key.wordCloudTerms) ? buckets[i].key.wordCloudTerms : '',
                        clusterDescription: '',
                        rollupCluster: (buckets[i].key.rollupIntent) ? buckets[i].key.rollupIntent : '',
                        suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
                        count: (buckets[i].rollupIntent.doc_count) ? buckets[i].rollupIntent.doc_count : 0,
                        similarityCutOff: (buckets[i].similarity.value) ? buckets[i].similarity.value : 0,
                        modifiedBy: (buckets[i].key.modifiedBy) ? buckets[i].key.modifiedBy : '',
                        modified: (buckets[i].key.modifiedAt) ? buckets[i].key.modifiedAt : 0,
                        finalized: (buckets[i].key.finalized) ? buckets[i].key.finalized : false,
                        finalizedOn: (buckets[i].key.finalizedAt) ? buckets[i].key.finalizedAt : 0,
                        finalizedBy: (buckets[i].key.finalizedBy) ? buckets[i].key.finalizedBy : ''
                    });
                }
            }
        }

        return clusterData;
    }

    async updateClusterData(client, account, app, projectId, runId, clusterId, source, params) {
        this._logger.info(`${TAG}:POST: Updating cluster for ${client}, account ${account}, app ${app}, project ${projectId}, run ${runId} and cluster ${clusterId}`);

        var updateClusterCopy = JSON.parse(JSON.stringify(updateCluster));
        updateClusterCopy.index = this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX);
        updateClusterCopy.body.script.source = source;
        updateClusterCopy.body.script.params = params;

        var filters = updateClusterCopy.body.query.bool.must[0].bool.must;
        for (var j in filters) {
            if (filters[j].term.project_id) {
                filters[j].term.project_id.value = projectId;
            }
            else if (filters[j].term.run_id) {
                filters[j].term.run_id.value = runId;
            }
            else if (filters[j].term.cluster_id) {
                filters[j].term.cluster_id.value = clusterId;
            }
        }

        const response = await this._connector.updateESData(updateClusterCopy);

        if (!response) {
            this._logger.error(`${TAG}: Error while updating cluster data in ES for project ${projectId}, run ${runId} and cluster ${clusterId}`);
        }
        else {
            return { status: 'success' }
        }
    }

    async updateConversationData(client, account, app, projectId, runId, clusterId, interactionId, source, params) {
        this._logger.info(`${TAG}:POST: Updating cluster for ${client}, account ${account}, app ${app}, 
         project ${projectId}, run ${runId}, cluster ${clusterId} and conversation ${interactionId}`);

        var updateConversationCopy = JSON.parse(JSON.stringify(updateConversation));
        updateConversationCopy.index = this._config.get(CONFIG_KEY.ES_CLUSTER_INDEX);
        updateConversationCopy.body.script.source = source;
        updateConversationCopy.body.script.params = params;

        var filters = updateConversationCopy.body.query.bool.must[0].bool.must;
        for (var j in filters) {
            if (filters[j].term.project_id) {
                filters[j].term.project_id.value = projectId;
            }
            else if (filters[j].term.run_id) {
                filters[j].term.run_id.value = runId;
            }
            else if (filters[j].term.cluster_id) {
                filters[j].term.cluster_id.value = clusterId;
            }
            else if (filters[j].term.interaction_id) {
                filters[j].term.interaction_id.value = interactionId;
            }
        }

        const response = await this._connector.updateESData(updateConversationCopy);

        if (!response) {
            this._logger.error(`${TAG}: Error while updating conversation data in ES for project ${projectId}, 
             run ${runId}, cluster ${clusterId} and conversation ${interactionId}`);
        }
        else {
            return { status: 'success' }
        }
    }

    async bulkIndexDocuments(dataset, indexName) {
        this._logger.debug('bulkIndexDocuments: Started saving the data...');
        this._logger.debug(JSON.stringify(dataset))

        this._logger.debug('Started processing the data from flatmap. Starting bulk index to ' + indexName);
        this._logger.debug(`${TAG}: starting bulk index for ` + JSON.stringify(dataset) + 'to index ' + indexName);

        const bulkResponse = await this._connector.bulkHelperIngest(dataset, indexName);

        if (!bulkResponse) {
            this._logger.info(`${TAG}: Error while indexing document data to ES`);
        }
        else if (bulkResponse.aborted) {
            this._logger.info(`${TAG}: bulk index failed for ` + JSON.stringify(dataset) + 'to index ' + indexName);
        }
        else {
            this._logger.debug(`${TAG}: bulk index successful for ` + JSON.stringify(dataset) + 'to index ' + indexName);
        }
        this._logger.debug(`${TAG}: Finished saving the data...`);
        return
    }

    async deleteAnalysisDataByCluster(clusterIdList, runId) {
        this._logger.info('Removing elastic Data');
        const res = await this._connector.deleteESDataByClusterId(clusterIdList, constants.ES_CONVERSATION_INDEX);
        if (!res) {
            this._logger.error(`Error while deleting conversation data in ES for runId ${runId}`);
        }
        return res;
    }

    async deleteAnalysisDataByRun(runId) {
        this._logger.info('Removing elastic Data ');
         const res = await this._connector.deleteESDataByRunId(runId, constants.ES_CLUSTER_INDEX);
        if (!res) {
            this._logger.info(`Error while removing cluster data in ES for runId ${runId}`);
        }
        return
    }
}
module.exports = ESDataLayer;

