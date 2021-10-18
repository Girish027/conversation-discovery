import { routeNames, getRoute } from 'utils/RouteHelper';


describe('utils/RouteHelper', function () {
  describe('routeNames', () => {
    test('should have the correct route paths', () => {
      expect(routeNames).toMatchSnapshot();
    });
  });

  describe('getRoute', () => {
    test('should construct route for given route with caa', () => {
      const route = routeNames.DISCOVER_INTENTS;
      const params = {
        clientId: '247ai',
        accountId: 'acc',
        appId: 'app',
      };
      expect(getRoute(route, params)).toMatchSnapshot();
    });

    test('should construct route for given route with caa and project ', () => {
      const route = routeNames.TOPIC_REVIEW;
      const params = {
        clientId: '247ai',
        accountId: 'acc',
        appId: 'app',
        projectId: 'pro-123'
      };
      expect(getRoute(route, params)).toMatchSnapshot();
    });

    test('should construct route for given route with all the params', () => {
      const route = routeNames.TOPIC_REVIEW;
      const params = {
        clientId: '247ai',
        accountId: 'acc',
        appId: 'app',
        projectId: 'pro-123',
        runId: 'run-234',
        clusterId: 'cluster-1234',
      };
      expect(getRoute(route, params)).toMatchSnapshot();
    });

    test('should construct route for given route not add clusterId if run is not present', () => {
      const route = routeNames.DISTRIBUTION_GRAPH;
      const params = {
        clientId: '247ai',
        accountId: 'acc',
        appId: 'app',
        projectId: 'pro-123',
        clusterId: 'cluster-1234',
      };
      expect(getRoute(route, params)).toMatchSnapshot();
    });
  });
});
