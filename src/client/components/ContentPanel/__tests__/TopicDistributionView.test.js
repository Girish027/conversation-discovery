import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConnectedTopicDistributionView, { TopicDistributionView } from 'components/ContentPanel/TopicDistributionView';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Constants from 'components/../constants';
import { runActions as runState } from 'state/runsState';
import { clusterActions as clusterState } from 'state/clusterState';
import * as globalActions from 'state/globalActions';
import * as amplitudeUtils from '../../../utils/amplitudeUtils';

jest.mock('utils/amplitudeUtils');
jest.mock('state/globalActions');

describe('<TopicDistributionView />', function () {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const runsState = {
    trackRuns: false,
    selectedRunId: 'run-59da2519-ed17-46ad-8294-1367e287589d',
    runs: [{
      runId: 'run-59da2519-ed17-46ad-8294-1367e287589d',
      projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
      runName: 'test-1564166348646',
      runDescription: 'trial',
      numOfTurns: 4,
      numOfClusters: 400,
      stopWords: '["hello","hilton"]',
      modified: 1564166848680,
      modifiedBy: 'abc@test.com',
      created: 1564166348680,
      createdBy: 'abc@test.com',
      runStatus: 'QUEUED',
      runStatusDescription: 'The run is queued',
      starred: 0
    }]
  };

  const projectsState = {
    activeProjectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
    projects: [{
      caaId: '247ai-referencebot-referencebot',
      created: 1563227027435,
      createdBy: 'user@247.ai',
      datasetName: 'test.csv',
      modified: 1563227027435,
      modifiedBy: 'user@247.ai',
      projectDescription: 'project A desc',
      projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
      projectName: 'project A',
      projectStatus: 'READY',
      projectStatusDescription: null,
    }]
  };

  const clustersState = {
    selectedClusterId: '',
    clusters: [{
      clusterId: '1',
      clusterName: 'cancel_order_customer_service', // this is the one getting edited
      originalName: 'cancel_order_customer_service',
      clusterDescription: 'relates to cancel order',
      rollupCluster: 'Cancel_Order',
      suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
      count: 230,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
      finalized: false,
      finalizedOn: undefined,
      finalizedBy: '',
    }, {
      clusterId: '2',
      clusterName: 'cancel_order_service',
      originalName: 'Cancel_Order',
      clusterDescription: 'order canceled',
      rollupCluster: 'Cancel_Order',
      suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
      count: 400,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
      finalized: false,
      finalizedOn: undefined,
      finalizedBy: '',
    }, {
      clusterId: '3',
      clusterName: 'store_close_holiday',
      originalName: 'store_close',
      clusterDescription: 'store closed due to reasons',
      rollupCluster: 'Store_Close',
      suggestedNames: ['merchant_close', 'abcde', 'defg'],
      count: 218,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
      finalized: false,
      finalizedOn: undefined,
      finalizedBy: '',
    }, {
      clusterId: '4',
      clusterName: 'size_and_position',
      originalName: 'size_and_position',
      clusterDescription: 'relates to size and position',
      rollupCluster: 'Store_Location',
      suggestedNames: ['position_size', 'store_location', 'defg'],
      count: 142,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400000,
      finalized: true,
      finalizedOn: undefined,
      finalizedBy: 'user1@247.ai',
    }]
  };

  const props = {
    clusters: fromJS(clustersState.clusters),
    selectedRunId: runsState.selectedRunId,
  };

  beforeAll(() => {
    // Mock store
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    store = mockStore(fromJS({
      app: {
        ...caa,
      },
      projects: projectsState,
      runs: runsState,
      clusters: clustersState,
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedTopicDistributionView />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<TopicDistributionView
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - connected component TopicDistributionView', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic TopicDistributionView component', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly when there are no clusters yet', () => {
      wrapper = getShallowWrapper({});
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders Rollup Distribution when there are clusters yet', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders Granular distribution for all clusters', () => {
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        showRollupGraph: false
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders Granular distribution for the selectedRollup cluster', () => {
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        showRollupGraph: false,
        selectedRollup: 'Cancel_Order'
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when finalized filter is applied', () => {
      const filters = {
        finalized: true
      };
      const newProps = { ...props, filters: fromJS(filters) };
      wrapper = getShallowWrapper(newProps);
      wrapper.setState({
        showRollupGraph: false,
        selectedRollup: 'Cancel_Order'
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when open filter is applied', () => {
      const filters = {
        open: true
      };
      const newProps = { ...props, filters: fromJS(filters) };
      wrapper = getShallowWrapper(newProps);
      wrapper.setState({
        showRollupGraph: false,
        selectedRollup: 'Cancel_Order'
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    let chartWrapper = {};
    let getSelection;
    beforeAll(() => {
      props.dispatch = jest.fn();
      clusterState.selectCluster = jest.fn(() => 'selectCluster');
      globalActions.downloadResults = jest.fn();
      runState.editRun = jest.fn(() => 'editRun');
    });

    beforeEach(() => {
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    test('onSelectCluster', () => {
      wrapper.instance().onSelectCluster('2');
      expect(clusterState.selectCluster).toHaveBeenCalledWith('2');
      expect(props.dispatch).toHaveBeenCalledWith('selectCluster');
    });

    test('onClickGranularBar: for all granular cluster distribution', () => {
      getSelection = jest.fn(() => [{ row: 2, column: 1 }]);
      chartWrapper = {
        getChart: () => ({
          getSelection
        })
      };
      wrapper.instance().onClickGranularBar({ chartWrapper });
      expect(clusterState.selectCluster).toHaveBeenCalledWith('3');
      expect(props.dispatch).toHaveBeenCalledWith('selectCluster');
    });

    test('onClickGranularBar: for rollup level granular cluster distribution', () => {
      getSelection = jest.fn(() => [{ row: 1, column: 1 }]);
      chartWrapper = {
        getChart: () => ({
          getSelection
        })
      };
      wrapper.setState({
        selectedRollup: 'Cancel_Order'
      });
      wrapper.instance().onClickGranularBar({ chartWrapper });
      expect(clusterState.selectCluster).toHaveBeenCalledWith('1');
      expect(props.dispatch).toHaveBeenCalledWith('selectCluster');
    });

    test('toggleGraphType', () => {
      expect(wrapper.state().showPieChart).toEqual(true);
      wrapper.instance().toggleGraphType();
      expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
      expect(wrapper.state().showPieChart).toEqual(false);
      // expect(wrapper.state().selectedRollup).toEqual('');
    });

    test('markAsComplete', () => {
      wrapper.instance().markAsComplete();
      expect(runState.editRun).toHaveBeenCalledWith(props.selectedRunId, {
        runStatus: Constants.status.COMPLETE,
        runStatusDescription: expect.any(String)
      }, false);
      expect(props.dispatch).toHaveBeenCalledWith('editRun');
    });

    test('downloadResults', () => {
      globalActions.downloadResults.mockReturnValue('downloadResults');
      wrapper.instance().downloadRunResults();
      expect(props.dispatch).toHaveBeenCalledWith('downloadResults');
      expect(globalActions.downloadResults).toHaveBeenCalled();
    });
  });
});
