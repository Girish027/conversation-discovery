/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

module.exports = {
  /**
     * TODO: The name of the service
     * @type {string}
     */
  SERVICE_NAME: 'conversation-discovery',
  SCHEDULER_NAME: 'conversation-fetcher',

  /**
     * Disabled header
     * @type {string}
     * @private
     */
  X_POWERED_BY: 'x-powered-by',

  /**
     * Header that reflects the active version of the service
     * Used by the health check
     * @type {string}
     * @private
     */
  X_SERVICE_VERSION_HEADER: 'X-TFS-Service-Version',

  /**
   * Header to identify internal proxy calls
   * @type {string}
   * @private
   */
  X_TFS_INTERNALPROXYCALL: 'x-tfs-internalproxycall',

  /**
     * Common MIME types
     * @type {string}
     */
  MIME_APP_URLENCODED: 'application/x-www-form-urlencoded',
  MIME_APP_JSON: 'application/json',
  MIME_APP_XML: 'application/xml',
  MIME_TEXT_PLAIN: 'text/plain',

  /**
     * Config Keys
     * @type {string}
     */
  LOG_CONFIG_KEY: 'service-log.config-path',
  GC_LOG_ENABLED_CONFIG_KEY: 'gc-log.enabled',
  LISTEN_PORT_CONFIG_KEY: 'listen.port',
  KEEPALIVE_TIMEOUT_CONFIG_KEY: 'listen.keepAliveTimeout',
  REQUEST_LOG_CONFIG_KEY: 'request-log.output-dir',
  REQUEST_LOG_FLUSHINTERVAL_CONFIG_KEY: 'request-log.flushinterval',
  HEARTBEAT_PATH_CONFIG_KEY: 'health.heartbeat-path',
  INACTIVE_DURATION_SEC: 'sessions.inactiveDurationSec',
  MAX_SESSION_COUNT: 'sessions.maxSessionCount',
  ANALYTICSKEY_CONFIG_KEY: 'analytics.apiKey',
  CONTENT_BASEURL_KEY: 'content.baseUrl',
  PLATFORM_BASEURL_KEY: 'platform.baseUrl',
  CONFIG_NAME_UI: 'ui',
  CONFIG_NAME_UI_KEY: 'configs.ui',
  CONFIGS_FILE_PATH: 'configs-file-path',
  NFS_MOUNT_PATH: 'nfs-mount-path',
  NFS_MOUNT_PATH_DC: 'nfs-mount-path-dc',
  ANALYTICS_INTERNAL_USER: 'Internal',
  ANALYTICS_EXTERNAL_USER: 'External',
  ITS_API_URL: 'configs.its.apiUrl',
  ITS_BASE_URL: 'configs.its.baseUrl',
  DM_API_URL: 'configs.dm.apiUrl',
  DM_BASE_URL: 'configs.dm.baseUrl',
  ANSWERS_BASE_URL: 'configs.answers.baseUrl',
  ANSWERS_API_KEY: 'configs.answers.clientApiKey',
  UNIFIED_PORTAL_URL: 'configs.ui.unifiedPortalUrl',
  IDT_DOC_PORTAL_URL: 'configs.ui.docPortalUrl',
  CONTACT_SUPPORT_URL_EXTERNAL: 'configs.ui.contactSupportUrlExternal',
  CONTACT_SUPPORT_URL_INTERNAL: 'configs.ui.contactSupportUrlInternal',
  GCP_BUCKET_NAME: 'gcp.bucketName',
  DOWNLOAD_BASE_PATH: 'downloadBasePath',
  UPLOAD_BASE_PATH: 'uploadBasePath',
  COOKIES_EXPIRES: 'cookies.expires',
  REDIS_HOSTS: 'celery.redisHosts',
  REDIS_CLUSTER_NAME: 'celery.redisClusterName',
  REDIS_QUEUE_NAME: 'celery.queue',
  CELERY_TASK: 'worker.run', //The name of the python-celery task to run
  ENV: 'env',
  LOCALHOST: 'localhost',
  FETCH_CLIENT_PRODUCT: 'configs.its.fetchClientForProduct',
  FETCH_CLIENT_ANSWERS: 'configs.its.fetchClientForAnswers',
  FETCH_CLIENT_CONVERSATIONS: 'configs.its.fetchClientForConversations',
  PRODUCT_ITS: 'configs.its.product_its',
  LIVE_DATA_ANALYSIS: 'Conversations Analysis',
  SYSTEM_PROJ_DESCRIPTION: (data) => `${data.startDate} to ${data.endDate}`,
  LIVE_DATA_IN_REVIEW: 'Conversations Analysis*',
  CANDIDATE_FAQ: 'Candidate FAQ',

  /** Errors */
  ERRORS: {
    NODE_NAME_NOT_IN_NOUN_VERB_FORM: 'NODE_NAME_NOT_IN_NOUN_VERB_FORM',
    DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
    PROJECT_ALREADY_EXISTS: 'PROJECT_ALREADY_EXISTS',
    CAA_ALREADY_EXISTS: 'CAA_ALREADY_EXISTS',
    RUN_ALREADY_EXISTS: 'RUN_ALREADY_EXISTS',
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
    RUN_NOT_FOUND: 'RUN_NOT_FOUND',
    CAA_DOES_NOT_EXISTS: 'CAA_DOES_NOT_EXIST',
    BODY_PARAMETERS_MISSING: 'BODY_PARAMETERS_MISSING',
    QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED: 'QUERY_BUILDER_DATA_TYPE_NOT_SUPPORTED',
    INVALID_POST_DATA_APP_NAME_NOT_PROVIDED: 'INVALID_POST_DATA_APP_NAME_NOT_PROVIDED',
    INVALID_POST_DATA_DATASET_NAME_NOT_PROVIDED: 'INVALID_POST_DATA_DATASET_NAME_NOT_PROVIDED',
    INVALID_POST_DATA_FILE_NOT_PROVIDED: 'INVALID_POST_DATA_FILE_NOT_PROVIDED',
    INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED: 'INVALID_POST_DATA_RUN_NAME_NOT_PROVIDED',
    INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED: 'INVALID_POST_DATA_NUM_OF_CLUSTERS_NOT_PROVIDED',
    INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED: 'INVALID_POST_DATA_NUM_OF_TURNS_NOT_PROVIDED',
    RUN_PROCESS_NOT_COMPLETE: 'RUN_PROCESS_NOT_COMPLETE',
    INVALID_S3_LOCATION_URI: 'INVALID_S3_LOCATION_URI',
    DATASET_FILE_IS_NOT_CSV: 'DATASET_FILE_IS_NOT_CSV',
    DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS: 'DATASET_FILE_DOES_NOT_HAVE_FOUR_COLUMNS',
    FAIL_TO_DELETE_DATASET_FILE_FROM_LOCAL: 'FAIL_TO_DELETE_DATASET_FILE_FROM_LOCAL',
    FAIL_TO_CREATE_RUN_TASK: 'FAIL_TO_CREATE_RUN_TASK',
    FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING: 'FAIL_TO_CREATE_RUN_TASK_TRANS_MISSING',
    NFS_UPLOAD_FILE_FAILED: 'NFS_UPLOAD_FILE_FAILED',
    NFS_DOWNLOAD_FILE_FAILED: 'NFS_DOWNLOAD_FILE_FAILED',
    NFS_DELETE_OBJECT_FAILED: 'NFS_DELETE_OBJECT_FAILED',
    NOT_A_NUMBER: 'NOT_A_NUMBER',
    FAIL_TO_UPDATE_ASSIGNED_INTENT: 'FAIL_TO_UPDATE_ASSIGNED_INTENT',
    FAIL_TO_INGEST_DATA: 'FAIL_TO_INGEST_DATA',
    FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET: 'FAILURE_DUE_TO_NON_ASCII_CHARACTERS_IN_DATASET',
    MAX_PROJ_NUM_EXCEEDED: 'MAX_PROJ_NUM_EXCEEDED',
    MAX_RUN_NUM_EXCEEDED: 'MAX_RUN_NUM_EXCEEDED',
    DOWNLOAD_PERMISSION_DENIED: 'DOWNLOAD_PERMISSION_DENIED',
    CREATE_PERMISSION_DENIED: 'CREATE_PERMISSION_DENIED',
    UPDATE_PERMISSION_DENIED: 'UPDATE_PERMISSION_DENIED',
    CLIENT_ID_NOT_PROVIDED: 'CLIENT_ID_NOT_PROVIDED',
    LANGUAGE_ID_NOT_PROVIDED: 'LANGUAGE_ID_NOT_PROVIDED',
    INVALID_OR_EMPTY_UTTERANCES: 'INVALID_OR_EMPTY_UTTERANCES',
    RESPONSE_TITLE_OR_RESPONSE_CONTENT_NOT_PROVIDED: 'RESPONSE_TITLE_OR_RESPONSE_CONTENT_NOT_PROVIDED',
    RESPONSE_TITLE_OR_RESPONSE_ID_NOT_PROVIDED: 'RESPONSE_TITLE_OR_RESPONSE_ID_NOT_PROVIDED',
    CANDIDATE_FOLDER_NOT_CREATED: 'CANDIDATE_FOLDER_NOT_CREATED',
    API_KEY_NOT_PROVIDED: 'API_KEY_NOT_PROVIDED',
    FORBIDDEN: 'FORBIDDEN',
  },

  /**
   * Session and cookie info
   * @type {string}
   */
  SESSION_COOKIE_NAME: 'conversation_discovery',
  SESSION_COOKIE_SECRET: 'keyboard',

  /**
   * MySQL related
   * @type {string}
   */
  MYSQL_HOST: 'mysql.host',
  MYSQL_USER: 'mysql.user',
  MYSQL_PASSWORD: 'mysql.password',
  MYSQL_PORT: 'mysql.port',
  MYSQL_DATABASE: 'mysql.database',
  MYSQL_CONNECTION_LIMIT: 'mysql.connection_limit',

  /**
   * ES related
   * @type {string}
   */
  ES_NODE: 'es.nodes',
  ES_MAXRETRIES: 'es.max_retries',
  ES_REQUEST_TIMEOUT: 'es.request_timeout',
  ES_SNIFF_ON_START: 'es.sniff_on_start',
  ES_CLUSTER_INDEX: 'es.idt_cluster_index',
  ES_CONVERSATION_INDEX: 'es.idt_conversation_index',
  INGEST_BATCH_SIZE: 200,


  /**
     * CSV related
     * @type {string}
   */
  CONVERSATION_CSV_HEADER: 'interaction_id,sequence,turn,processed_body',

  /** DB ERROR CODES */
  DB_ERROR_CODES: {
    ER_NO_REFERENCED_ROW: 'ER_NO_REFERENCED_ROW',
    ER_NO_REFERENCED_ROW_2: 'ER_NO_REFERENCED_ROW_2',
    ER_DUP_ENTRY: 'ER_DUP_ENTRY'
  },

  //TODO: Have a map of code and description
  /** PROJECT STATUS CODES */
  PROJECT_STATUS_CODES: {
    NEW: 'NEW',
    IN_REVIEW: 'REVIEW',
    QUEUED: 'QUEUED',
    QUEUED_STATUS_DESCRIPTION: 'The project is queued',
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
    VERIFYING: 'VERIFYING',
    FAILED: 'FAILED'
  },

  PROJECT_TYPES: {
    MANUAL: 'MANUAL',
    SYSTEM: 'SYSTEM'
  },

  /** RUN STATUS CODES */
  RUN_STATUS_CODES: {
    QUEUED: 'QUEUED',
    READY: 'READY',
    COMPLETE: 'COMPLETE',
    QUEUED_STATUS_DESCRIPTION: 'The run is queued'
  },

  /** RUN DEFAULTS */
  RUN_DEFAULTS: {
    DEFAULT_RUN_NAME: 'DefaultAnalysis',
    DEFAULT_RUN_DESCRIPTION: 'This is a default analysis',
    DEFAULT_NUM_OF_CLUSTERS: -1,
    DEFAULT_NUM_OF_TURNS: 1,
    DEFAULT_STARRED_VALUE: 0,
    DEFAULT_STOP_WORDS: []
  },

  /** LIMITS */
  PROJ_LIMIT: 20,
  RUN_LIMIT: 20,

  /**
   * Security
   * @type {string}
   */
  IS_SECURITY_ENABLED: 'security.enabled',
  ISSUER: 'security.oidc.issuer',
  CLIENT_ID: 'security.oidc.client_id',
  CLIENT_SECRET: 'security.oidc.client_secret',
  REDIRECT_URI: 'security.oidc.redirect_uri',
  SCOPE: 'security.oidc.scope',
  OKTA_URL: 'security.okta_url',
  OKTA_ACCOUNT_URL: 'security.okta_account_url', // user Account url link
  AUTHORIZATION_ENABLED: 'security.authorization_enabled', //For tests, this will be false
  TRUSTED_FLOW_SEC_MESSAGE: 'UPDATE_SUCCESSFULL',

  /**
   * Project Parameters to be Updated
   */
  UPDATE_PROJECT_PARAMETERS: {
    PROJECT_NAME: 'projectName',
    PROJECT_DESCRIPTION: 'projectDescription'
  },

  TABLES: {
    PROJECT: 'project',
    RUN: 'run',
    CAA: 'caa'
  },

  HTTP_ERROR: {
    USER_IS_UNAUTHORIZED: 'USER_IS_UNAUTHORIZED',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
  },

  PII_MASK_REGEX: {
    MASKED_EMAILID: 'abc@xyz.com',
    MASKED_DIGITS: '#',
    MASKED_SCRIPT_TAGS: '',
  },

  ANSWERS_API_URLS: {
    UPDATE_QUESTIONS: (data) => `${data.basePath}responses/addQuestionByResponseID/interfaceID/${data.interfaceId}/responseID/${data.responseId}?clientName=${data.clientId}`,
    POST_CANDIDATE_FAQ_FOLDER: (data) => `${data.basePath}folders/createFolder/interfaceID/${data.interfaceId}/parentFolderID/${data.parentFolderId}?clientName=${data.clientId}`,
    GET_INTERFACES_LIST: (data) => `${data.basePath}interface/listInterface?clientName=${data.clientId}`,
    GET_FAQS: (data) => `${data.basePath}responses/listResponsesByFolder/interfaceID/${data.interfaceId}/${data.folderId}?clientName=${data.clientId}`,
    POST_FAQ: (data) => `${data.basePath}responses/createResponseContentByFolder/interfaceID/${data.interfaceId}/folderID/${data.folderId}/languageID/${data.languageId}?clientName=${data.clientId}`
  },

  API_URLS: {
    GET_INTENTS: (data) => `${data.basePath}clients/${data.clientId}/apps/${data.appId}/nodes?offset=${data.offset}&limit=${data.limit}&isModified=${data.isModified}`,
    UPDATE_INTENTS: (data) => `${data.basePath}clients/${data.clientId}/apps/${data.appId}/nodes/${data.nodeId}`,
    CREATE_INTENTS: (data) => `${data.basePath}clients/${data.clientId}/apps/${data.appId}/nodes/${data.parentNodeId}/children`,
    GET_CLIENT_CONFIG: (data) => `${data.itsApiUrl}clients?includeApps=true`,
  },
  INTENT_FETCH_LIMIT: 200,
  DELETE_STATUS_UPDATE: {
    starred: 1
  },
  RETRY_THRESHOLD: 3,

  roles: {
    unauthorized: 'unauthorized',
    viewer: 'viewer',
    tester: 'tester',
    developer: 'developer',
    operator: 'operator',
    admin: 'admin',
    internaladmin: 'internaladmin'
  },
  
  roleHierarchy: {
    ['unauthorized']: 0,
    ['viewer']: 1,
    ['tester']: 2,
    ['developer']: 3,
    ['operator']: 4,
    ['admin']: 5,
    ['internaladmin']: 6
  },
  
  viewer: ['GET'],
};
