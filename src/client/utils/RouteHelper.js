import { basePath } from '../swagger.json';

const baseRoute = `${basePath}/ui`;

const routeParams = ({
  clientId, appId, accountId, projectId, runId, clusterId, componentClientId
}) => {
  let params = `?clientid=${clientId}&accountid=${accountId}&appid=${appId}&componentClientId=${componentClientId}`;
  if (projectId) {
    params += `&project=${projectId}`;
    if (runId) {
      params += `&run=${runId}`;
      if (clusterId) {
        params += `&cluster=${clusterId}`;
      }
    }
  }

  return params;
};

export const routeNames = {
  BASE_ROUTE: baseRoute,
  HOME_PAGE: basePath,
  DISCOVER_INTENTS: `${baseRoute}/discover-intents`,
  DISTRIBUTION_GRAPH: `${baseRoute}/run-overview`,
  TOPIC_REVIEW: `${baseRoute}/topic-review`
};

export const getRoute = (routeName, params = {}) => routeName + routeParams(params);
