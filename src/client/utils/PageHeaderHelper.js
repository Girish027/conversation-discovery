import { getRoute, routeNames } from 'utils/RouteHelper';
import { push } from 'connected-react-router';
import ObjectUtils from './ObjectUtils';
import Constants from '../constants';

// Note: order of items is the order Analyse Run breadcrumbs is rendered
const items = {
  discoverIntents: {
    label: 'discoverIntents',
  },
  projectView: {
    label: 'projectView',
    route: routeNames.DISCOVER_INTENTS
  },
  runView: {
    label: 'runView',
    route: routeNames.DISTRIBUTION_GRAPH
  },
};

const distributionItems = ObjectUtils.filterSpecificKeys(items, ['discoverIntents', 'projectView']);

export const goToBotOverview = () => {
  window.location.assign('#');
};
const getBreadCrumbItem = (label, data = {}, route, type = '', givenOnClick, readOnly = false) => {
  if (label) {
    const { dispatch, ...params } = data;
    let onClick;
    if (!readOnly) {
      if (givenOnClick) {
        onClick = givenOnClick;
      } else {
        onClick = () => dispatch(push(getRoute(route, params)));
      }
    }
    return {
      value: type + label,
      label,
      readOnly,
      onClick,
      ...params,
    };
  }
  return undefined;
};

const discoverIntents = 'Discover Intents';
const botOverview = 'Intent Discovery';
const overview = 'Overview';

const breadcrumbsMap = {
  botOverview: (data) => getBreadCrumbItem(botOverview, data, undefined, '', () => goToBotOverview()),
  discoverIntents: () => getBreadCrumbItem(discoverIntents, undefined, undefined, '', undefined, true),
  projectView: (data, route) => {
    let name = data.projectName;
    if (data.projectType && data.projectType === Constants.projects.SYSTEM) {
      name = Constants.LIVE_DATA_ANALYSIS;
    }
    return getBreadCrumbItem(name, data, route, 'project');
  },
  runView: (data, route) => getBreadCrumbItem(`${data.runName} ${overview}`, data, route, 'run'),
  clusterView: (data, route) => getBreadCrumbItem(data.clusterName, data, route, 'cluster'),
};

const defaultDetails = {
  title: () => discoverIntents
};

// Note: If action Items are to be added, it should be added in  detailsMap
// KeyName should be 'actionItems' .
// Ref: PageHeader component from '@tfs/ui-components'.
export const detailsMap = {
  [routeNames.BASE_ROUTE]: defaultDetails,
  [routeNames.HOME_PAGE]: defaultDetails,
  [routeNames.DISCOVER_INTENTS]: defaultDetails,
  [routeNames.TOPIC_REVIEW]: {
    title: () => 'Topic Review',
    breadcrumbItems: Object.values(items)
  },
  [routeNames.DISTRIBUTION_GRAPH]: {
    title: (runName) => `${runName} ${overview}`,
    breadcrumbItems: Object.values(distributionItems)
  },
};

/**
 * gets the Page Subheader title, breadcrumbs, action Items based on routeName
 * @param  {Object} data - should contain the following required params
 *  - required params
 *     - itsBaseURL, routeName, clientId, accountId, appId, dispatch
 *  - Optional combination params
 *    - projectName + projectId
 *    - runName + runId
 *    - clusterName + clusterId
 * @return {[Object]} should contain title of page, breadcrumbs array as expected by TFS UI PageHeader, actionItems
 */
export const getPageDetails = (data) => {
  let { routeName } = data;
  const { runName } = data;
  if (routeName[routeName.length - 1] === '/') {
    routeName = routeName.slice(0, routeName.length - 1);
  }
  const { [routeName]: detailsObj = {} } = detailsMap;
  const { title = () => {}, breadcrumbItems = [] } = detailsObj;
  const breadcrumbArray = [];
  breadcrumbItems.forEach((item) => {
    const breadcrumb = breadcrumbsMap[item.label](data, item.route);
    if (breadcrumb) {
      breadcrumbArray.push(breadcrumb);
    }
  });
  return {
    title: title(runName),
    breadcrumb: breadcrumbArray
  };
};
