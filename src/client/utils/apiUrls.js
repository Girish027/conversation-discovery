import { basePath } from '../swagger.json';

const root = (process.env.NODE_ENV === 'production'
  ? '//'.concat(window.location.host)
  : '//localhost:8080')
  .concat(basePath);

const clientInfoPath = (data) => `${root}/clients/${data.componentClientId}/accounts/${data.accountId}/applications/${data.appId}`;
const projectInfo = ({ projectId }) => `projects/${projectId}`;
// TODO remove mockServer once APIs are implemented
// const runsInfo = ({ runId }) => `runs/${runId}/mockServer/`;
const runsInfo = ({ runId }) => `runs/${runId}`;
const clusterInfo = ({ clusterId }) => `clusters/${clusterId}`;
const transcriptInfo = ({ transcriptId }) => `conversations/${transcriptId}`;
const conversationTranscriptInfo = (transcriptId) => `conversations?tId=${transcriptId}`;

// TODO: Curation
// API: ....conversations?transcriptIds=['abc', 'def']&moveTo=<new cluster id>

export const apiUrls = {
  authentications: `${root}/authentications?self=true`,
  userConfigUrl: `${root}/user/config`,
  conversationsConfigUrl: `${root}/user/conversationsConfig`,
  answersConfigUrl: `${root}/user/answersConfig`,
  downloadTemplate: (data) => `${clientInfoPath(data)}/templates`,
  projects: (data) => `${clientInfoPath(data)}/projects`,
  oneProject: (data) => `${clientInfoPath(data)}/${projectInfo(data)}`,
  runs: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/runs`,
  oneRun: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}`,
  downloadRun: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/results?type=original`,
  clusters: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/clusters`,
  oneCluster: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/${clusterInfo(data)}`,
  conversations: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/${clusterInfo(data)}/conversations`,
  transcript: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/${clusterInfo(data)}/${transcriptInfo(data)}`,
  intents: (data) => `${clientInfoPath(data)}/${projectInfo(data)}/runs/${data.runId}/${clusterInfo(data)}/intents`,
  conversationTranscript: (data, transcriptId) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/${clusterInfo(data)}/${conversationTranscriptInfo(transcriptId)}`,
  interfaces: (data) => `${root}/clients/${data.componentClientId}/interfaces`,
  faqs: (data, interfaceId) => `${clientInfoPath(data)}/${projectInfo(data)}/${runsInfo(data)}/${clusterInfo(data)}/interfaceId/${interfaceId}/addToAnswers`
};
