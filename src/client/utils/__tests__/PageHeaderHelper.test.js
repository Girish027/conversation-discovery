import * as PageHeaderHelper from 'utils/PageHeaderHelper';
import * as routerActions from 'connected-react-router';
import { getRoute, routeNames } from 'utils/RouteHelper';

jest.mock('connected-react-router');

describe('utils/PageHeaderHelper', function () {
  const commonData = {
    itsBaseUrl: 'https://its.com/',
    clientId: '247ai',
    accountId: 'tfscorp',
    appId: 'referencebot',
    dispatch: () => {},
  };
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('detailsMap', () => {
    test('should have mappings between route, title and breadcrumbs', () => {
      expect(PageHeaderHelper.detailsMap).toMatchSnapshot();
    });
  });

  describe('getPageDetails', () => {
    beforeAll(function () {

    });
    test('should get correct title and breadcrumbs for Discover Intents Route', () => {
      const pageData = {
        projectId: 'pro-123',
        projectName: 'project 123',
        routeName: routeNames.DISCOVER_INTENTS
      };
      expect(PageHeaderHelper.getPageDetails({ ...commonData, ...pageData })).toMatchSnapshot();
    });

    test('should get correct title and breadcrumbs for Distribution Graph Route', () => {
      const pageData = {
        projectId: 'pro-123',
        projectName: 'project 123',
        runId: 'run-123',
        runName: 'Run 123',
        routeName: routeNames.DISTRIBUTION_GRAPH
      };
      expect(PageHeaderHelper.getPageDetails({ ...commonData, ...pageData })).toMatchSnapshot();
    });

    test('should get correct title and breadcrumbs for Topic Review Route', () => {
      const pageData = {
        projectId: 'pro-123',
        projectName: 'project 123',
        runId: 'run-123',
        runName: 'Run 123',
        clusterId: 'cluster-234',
        clusterName: 'cancel_order',
        routeName: routeNames.TOPIC_REVIEW
      };
      expect(PageHeaderHelper.getPageDetails({ ...commonData, ...pageData })).toMatchSnapshot();
    });
  });

  describe('clickHandlers', () => {
    describe('goToBotOverview', () => {
      beforeEach(function () {
        window.location.assign = jest.fn();
      });
      test('should navigate to given itsURL', () => {
        const data = commonData;
        expect(PageHeaderHelper.goToBotOverview(data));
        expect(window.location.assign).not.toHaveBeenCalledWith(`${data.itsBaseUrl}?clientid=${data.clientId.toLowerCase()}&accountid=${data.accountId.toLowerCase()}&appid=${data.appId.toLowerCase()}`);
        expect(window.location.assign).toHaveBeenCalledWith('#');
      });
    });

    describe('Specific handler - should change route', () => {
      const pageData = {
        projectId: 'pro-123',
        projectName: 'project 123',
        runId: 'run-123',
        runName: 'Run 123',
        clusterId: 'cluster-234',
        clusterName: 'cancel_order',
        routeName: `${routeNames.DISTRIBUTION_GRAPH}/`, // this is how the route location would be
      };
      let pageDetails;

      beforeEach(function () {
        commonData.dispatch = jest.fn();
        routerActions.push = jest.fn();
        pageDetails = PageHeaderHelper.getPageDetails({ ...commonData, ...pageData });
      });

      test('should navigate to corresponding route when clicked on project name', () => {
        routerActions.push.mockReturnValue('router action push');
        const { breadcrumb } = pageDetails;
        const projectBreadcrumb = breadcrumb[1];
        const { onClick: onClickProject } = projectBreadcrumb;
        onClickProject();
        expect(commonData.dispatch).toMatchSnapshot();
        expect(routerActions.push).toHaveBeenCalledWith(getRoute(routeNames.DISCOVER_INTENTS, { ...commonData, ...pageData }));
      });

    });
  });
});
