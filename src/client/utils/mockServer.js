const projectsList = [{
  projectId: '0',
  projectName: 'project Xyz',
  created: '1554930505916',
  createdBy: 'litta.zachariah@247.ai',
  modified: '1554930505916',
  moifiedBy: 'litta.zachariah@247.ai',
  description: 'project abc description',
  datasetName: 'TrialData.csv',
  datasetUrl: 'some/url/to/dataset',
  projectStatus: 'QUEUED',
  projectStatusDescription: 'QUEUED',
}, {
  projectId: '1',
  projectName: 'project Abc',
  created: '1554930400000',
  createdBy: 'litta.zachariah@247.ai',
  modified: '1554930400000',
  moifiedBy: 'litta.zachariah@247.ai',
  projectCreatedBy: 'litta.zachariah@247.ai',
  description: 'project xyz description',
  datasetName: 'SampleData.csv',
  datasetUrl: 'some/url/to/dataset',
  projectStatus: 'VALIDATED',
}];

const urls = {
  createProject: '//localhost:8080/conversation-discovery/clients/247ai/accounts/referencebot/applications/referencebot/projects',
  getProject: '//localhost:8080/conversation-discovery/clients/247ai/accounts/referencebot/applications/referencebot/projects',
  allProjects: '//localhost:8080/conversation-discovery/clients/247ai/accounts/referencebot/applications/referencebot',

};

const clusters = [{
  clusterId: '1',
  clusterName: 'topic_intent_1', // this is the one getting edited
  originalName: 'cancel_order_customer_service',
  clusterDescription: 'relates to cancel order',
  rollupCluster: 'Rollup_ABC',
  suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
  count: 230,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: false,
  finalizedOn: undefined,
  finalizedBy: '',
  similarityCutOff: 0.79,
}, {
  clusterId: '2',
  clusterName: 'topic_sample_2',
  originalName: 'Cancel_Order',
  clusterDescription: 'order canceled',
  rollupCluster: 'Rollup_Sample',
  suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
  count: 400,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: false,
  finalizedOn: undefined,
  finalizedBy: '',
  similarityCutOff: 0.69,
}, {
  clusterId: '3',
  clusterName: 'discovered_intent_3',
  originalName: 'store_close',
  clusterDescription: 'store closed due to reasons',
  rollupCluster: 'Rollup_ABC',
  suggestedNames: ['merchant_close', 'abcde', 'defg'],
  count: 218,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: false,
  finalizedOn: undefined,
  finalizedBy: '',
  similarityCutOff: 0.59,
}, {
  clusterId: '4',
  clusterName: 'another_topic_4',
  originalName: 'size_and_position',
  clusterDescription: 'relates to size and position',
  rollupCluster: 'Rollup_Another',
  suggestedNames: ['position_size', 'store_location', 'defg'],
  count: 142,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: true,
  finalizedOn: undefined,
  finalizedBy: 'user1@247.ai',
  similarityCutOff: 0.85,
}, {
  clusterId: '5',
  clusterName: 'intent_with_very_looooong_name',
  originalName: 'Place_Order',
  clusterDescription: 'relates to cancel order',
  rollupCluster: 'Rollup_Something',
  suggestedNames: ['multiple_order', 'abcde', 'defg'],
  count: 129,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: false,
  finalizedOn: undefined,
  finalizedBy: '',
  similarityCutOff: 0.80,
}, {
  clusterId: '6',
  clusterName: 'food_order_ready',
  originalName: 'Food_Ready',
  clusterDescription: 'food is ready for pickup',
  rollupCluster: 'Rollup_ABC',
  suggestedNames: ['food_ready_asap', 'abcde', 'defg'],
  count: 260,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: true,
  finalizedOn: 1554930400000,
  finalizedBy: 'user1@247.ai',
  similarityCutOff: 0.84,
}, {
  clusterId: '7',
  clusterName: 'delivery_time',
  originalName: 'delivery_time',
  clusterDescription: 'relates to delivery time',
  rollupCluster: 'Rollup_XYZ',
  suggestedNames: ['food_ready', 'abcde', 'defg'],
  count: 260,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: true,
  finalizedOn: 1554930400000,
  finalizedBy: 'user1@247.ai',
  similarityCutOff: 0.89,
}, {
  clusterId: '8',
  clusterName: 'pickup_ready_query',
  originalName: 'Order_Ready',
  clusterDescription: 'food is ready for pickup',
  rollupCluster: 'Rollup_XYZ',
  suggestedNames: ['food_ready_asap', 'abcde', 'defg'],
  count: 260,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: true,
  finalizedOn: 1554930400000,
  finalizedBy: 'user1@247.ai',
  similarityCutOff: 0.99,
},
{
  clusterId: '9',
  clusterName: 'placement_query',
  originalName: 'Order_Ready',
  clusterDescription: 'order canceled',
  rollupCluster: 'Rollup_ABC',
  suggestedNames: ['order_Ready_food', 'abcde', 'defg'],
  count: 400,
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
  finalized: false,
  finalizedOn: undefined,
  finalizedBy: '',
  similarityCutOff: 0.98,
}];

const conversations = [{
  transcriptId: 'qwe-qwe',
  sentenceSet: `Hello! Is it possible to refund an order I canceled through the restaurant $$I was not able to cancel it through door dash but was able to cancel
through the restaurant . Yes I am. Yes that would be perfect! Thank you so much`,
  originalSimilarity: 0.67,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
}, {
  transcriptId: 'abc-abc',
  sentenceSet: `hello. I placed an order with Garbanzo Mediterranean and the driver called me to inform me that they closed early because of NYE. I tried to
cancel the order in hopes of a refund and was not allowed to. Am I able to receive a refund since I did not get me food . Will this refund become
credits or back into my account`,
  originalSimilarity: 0.89,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'pqr-pqr',
  sentenceSet: `My order was supposed to be delivered 15 minutes ago, then came up with an unknown eta contact support message, and now says my estimated eta is 6080 minutes, 
  is my order still coming This is ridiculous..Yes correct. Okay thank you$$Any updates `,
  originalSimilarity: 0.97,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'xyz-xyz',
  sentenceSet: 'hello, I have an order from Qdoba for Alexander, but the restaurant is closed for the night.$$It opens back up tomorrow at 10:30',
  originalSimilarity: 0.46,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'abc-lmn',
  sentenceSet: 'I would like to cancel ordsr for the rest of the day. please. amount of business is to high and I`m the manager on duty my name is Fernando . thank u',
  originalSimilarity: 0.67,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'lmn-abc',
  sentenceSet: 'I would like to cancel ordsr for the rest of the day. please. amount of business is to high and I`m the manager on duty my name is Fernando . thank u',
  originalSimilarity: 0.50,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'xxx-abc',
  sentenceSet: 'I would like to cancel ordsr for the rest of the day. please. amount of business is to high and I`m the manager on duty my name is Fernando . thank u',
  originalSimilarity: 0.80,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
},
{
  transcriptId: 'ttt-abc',
  sentenceSet: 'I would like to cancel ordsr for the rest of the day. please. amount of business is to high and I`m the manager on duty my name is Fernando . thank u',
  originalSimilarity: 0.72,
  originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
  previousCluster: 'previous-cluster-id',
  currentCluster: 'current-cluster-id',
  modifiedBy: 'user1@247.ai',
  modified: 1554930400000,
}];

const intents = {
  data: [{
    nodeName: 'Cancel_reservation',
    nodeId: '420f9b81-450c-46d7-85d0-a23f5c4d9445',
    normalizedName: 'Reservation_Cancel'
  },
  {
    nodeName: 'Agent_Request',
    nodeId: '420f9b81-450c-46d7-85d0-a23f5c4d9445',
    normalizedName: 'Reservation_Cancel'
  },
  {
    nodeName: 'Cancel_order',
    nodeId: '420f9b81-450c-46d7-85d0-a23f5c4d9445',
    normalizedName: 'Reservation_Cancel'
  }
  ]
};

const transcript = {
  transcriptId: 'selected transcript id from response',
  turns: [{
    turnSequence: 1,
    from: 0, // 0 - Agent, 1 - Visitor
    message: 'How can we help?'
  }, {
    turnSequence: 2,
    from: 1, // 0 - Agent, 1 - Visitor
    message: 'I need to cancel my order'
  }]
};

const mockServer = ({
  url, dispatch, onApiSuccess, data
}) => {
  if (url === urls.allProjects) {
    dispatch(onApiSuccess(projectsList));
  } else if (url === urls.createProject) {
    // create Project
    projectsList.push({
      ...projectsList[0],
      projectId: projectsList.length,
      projectName: data.get('projectName'),
      description: data.get('description'),
      datasetName: data.get('datasetName'),
    });
    dispatch(onApiSuccess(projectsList[projectsList.length - 1]));
  } else if (url.includes(url.getProject)) {
    // get project
    const pathArray = url.split('/');
    const projectId = pathArray[pathArray.length - 1];
    const project = projectsList.find((proj) => proj.projectId === projectId);
    dispatch(onApiSuccess(project));
  } else if (url.indexOf('conversations/') !== -1) { // oneConversation = transcript
    dispatch(onApiSuccess(transcript));
  } else if (url.indexOf('conversations') !== -1) { // all conversations in a cluster
    dispatch(onApiSuccess(conversations));
  } else if (url.indexOf('clusters/') !== -1) { // oneCluster
    dispatch(onApiSuccess(clusters[0]));
  } else if (url.indexOf('clusters') !== -1) { // all clusters
    dispatch(onApiSuccess(clusters));
  } else if (url.indexOf('nodes') !== -1) { // all intents from DM
    dispatch(onApiSuccess(intents));
  }

  // TODO: download APIs mock
};

export default mockServer;
