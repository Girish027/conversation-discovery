import { basePath } from './swagger.json';
import { apiUrls } from './utils/apiUrls';

const domain = process.env.NODE_ENV === 'production' ? '//'.concat(window.location.host) : '//localhost:8080';

const constants = {
  environment: process.env.NODE_ENV,
  toolName: 'CDT',
  locale: 'en',
  eventNames: {
    logOutEvent: 'ClickLogoutUser',
    selectClientEvent: 'SelectClientEvent'
  },
  serverApiUrls: apiUrls,
  oktaApiUrls: {
    currentSession: '/api/v1/sessions/me'
  },
  udeFramework: 'https://d1af033869koo7.cloudfront.net/frontends/files/js/widget-loader-extensible.min.js',
  userOktaAccountLink: 'https://sso-247-inc.oktapreview.com/enduser/settings',
  navbar: {
    title: 'INTENT DISCOVERY',
    logoutUrl: domain.concat(`${basePath}/logout`)
  },
  contentUrl: {
    stable: 'http://virt-asst-content-stable.api.247-inc.net',
    production: 'http://virt-asst-content.api.247-inc.net',
    staging: 'http://virt-asst-content-staging.api.247-inc.net'
  },
  modals: {
    confirm: 'ConfirmationDialog',
    createProject: 'CreateProjectModal',
    editProject: 'EditProjectModal',
    createRun: 'CreateRunModal',
    editRun: 'EditRunModal',
    editCluster: 'EditClusterModal',
    progress: 'ProgressModal',
    unauthorized: 'SimpleModal',
    addToBot: 'AddToBotModal',
    addToFaq: 'AddToFaqModal'
  },

  buttons: {
    cancel: 'CANCEL',
    analyze: 'ANALYZE',
    analyzing: 'ANALYZING',
    submit: 'SUBMIT',
    save: 'SAVE',
    submitting: 'SUBMITTING...',
    next: 'NEXT',
    yesCancel: 'YES, CANCEL',
    dontCancel: 'NO, GO BACK',
    delete: 'DELETE',
    ok: 'OK',
    createNewRun: 'RUN A NEW ANALYSIS',
    createNewProject: 'CREATE A NEW PROJECT',
    uploadYourTranscripts: 'UPLOAD YOUR TRANSCRIPTS',
    start: 'START',
    refresh: 'REFRESH',
    download: 'DOWNLOAD',
    markAsComplete: 'MARK AS COMPLETE',
    viewRollupGraph: '<< VIEW ROLLUP DISTRIBUTION',
    viewGranularGraph: 'VIEW GRANULAR DISTRIBUTION',
    viewPieChart: 'VIEW DONUT CHART',
    viewBarChart: 'VIEW BAR CHART',
    runOverview: 'GO TO OVERVIEW',
    addToBot: 'ADD TO CONVERSATIONS',
    addToBotIntent: 'ADD',
    addingToBot: 'ADDING...',
    addToFAQ: 'ADD TO ANSWERS',
    expandAll: 'EXPAND ALL',
    collapseAll: 'COLLAPSE ALL',
    conversations: 'CONVERSATIONS',
    answers: 'ANSWERS'
  },
  status: {
    QUEUED: 'QUEUED',
    IN_PROGRESS: 'IN PROGRESS',
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
    VERIFYING: 'VERIFYING',
    FAILED: 'FAILED',
    READY: 'READY',
    COMPLETE: 'COMPLETE',
    ERROR: 'ERROR',
    NEW: 'NEW',
    IN_REVIEW: 'REVIEW',
  },
  projects: {
    SYSTEM: 'SYSTEM',
    MANUAL: 'MANUAL',
  },
  LIVE_DATA_ANALYSIS: 'Conversations Analysis',
  LIVE_DATA_IN_REVIEW: 'Conversations Analysis*',
  PROJECT_ALREADY_EXISTS: 'PROJECT_ALREADY_EXISTS',
  OTHER_CLUSTER: 'other',
  noop: () => { },
  maxDatasetFileSize: 200 * 1000000, // 200 MB
  pageTitle: 'Discover Intent',
  notification: {
    error: 'error',
    warning: 'warning',
    info: 'info',
    success: 'success'
  },
  pollingInterval: 10000,
  clustersPollingInterval: 30000,
  notificationInterval: 3000,

  // Modal Info
  modalInfo: {
    createRun: {
      header: 'Create a New Analysis',
      id: 'CreateRun'
    },
    editRun: {
      header: 'Edit Analysis Details',
      id: 'EditRun'
    },
    editProject: {
      header: 'Edit Transcript Details',
      id: 'EditProject'
    },
    editCluster: {
      header: 'Edit Topic',
      id: 'EditCluster'
    },
    addBot: {
      header: 'Add to Conversations',
      id: 'addBot'
    },
    addFaq: {
      header: 'Add to Answers',
      id: 'addFaq'
    }
  },
  utteranceMode: {
    options: ['Conversations', 'Answers'],
    answers: 'Answers',
    conversations: 'Conversations',
    modeLabel: 'MODE'
  },
  mappingTo: {
    intent: 'Intent',
    faq: 'FAQ'
  },

  // local storage keys
  localStorageBucket: 'cfdStore',
  activeProjectId: 'activeProjectId',
  isAnswers: 'isAnswers',
  isConversations: 'isConversations',
  userRole: 'userRole',
  selectedRunId: 'selectedRunId',
  clusterfilters: 'clusterfilters',
  clusterSort: 'clusterSort',
  clusterSearchString: 'clusterSearchString',

  sortOrder: {
    asc: 'asc',
    desc: 'desc',
    none: 'none',
  },

  // Distribution Graph
  DISTRIBUTION_GRAPH: {
    hAxis: 'Topic',
    vAxis: 'Volume',
    wordCloudTermsLable: 'wordCloudTerms',

    chartType: {
      barChart: 'ColumnChart',
      pieChart: 'PieChart',
    },
    graphOptions: {
      title: 'Topic Distribution',
      hAxis: { title: 'Topics' },
      vAxis: { title: 'Volume (Count)' },
      pieHole: 0.5,
      sliceVisibilityThreshold: 0.005,
    }
  },

  filterClusterByVolume: {
    volumeByCount: 'volumeByCount',
    volumeByPercent: 'volumeByPercent'
  },
  // Dialog Manager api defaluts
  nodeInfo: {
    parentNodeId: '00000000-0000-0000-0000-000000000000',
    responses: [{
      event: 'success', messageType: 'out.msg', mimeType: 'text/html', locale: 'en-US', offset: 0
    }]
  },
  previewWidgetPath: domain,
  ICON_DISCOVERY: 'icon_discovery',

  // Project Limit
  PROJ_LIMIT: 20,

  // Run Limit
  RUN_LIMIT: 20,
};

export const PREVIEW_ACTION_LIST = {
  conversationsInit: [
    'loadViewInchat',
  ],
};

export default constants;
