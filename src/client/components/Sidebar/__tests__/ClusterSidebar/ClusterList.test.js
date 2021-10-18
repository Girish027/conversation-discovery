import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { ClusterList } from '../../ClusterSidebar/ClusterList';
import { clusterActions } from 'state/clusterState';

describe('<ClusterList />', () => {
  let wrapper;

  const clusterState = [
    {
      rollupCluster: 'Cancel_Order',
      count: '630',
      clusters: [{
        clusterId: '1',
        clusterName: 'cancel_order_customer_service', // this is the one getting edited
        originalName: 'cancel_order_customer_service',
        clusterDescription: 'relates to cancel order',
        rollupCluster: 'Cancel_Order',
        suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
        count: 230,
        finalized: false,
        modifiedBy: 'user1@247.ai',
        modified: 1554930400001,
        finalizedBy: '',
      }, {
        clusterId: '2',
        clusterName: 'Cancel_Order',
        originalName: 'Cancel_Order',
        clusterDescription: 'order canceled',
        rollupCluster: 'Cancel_Order',
        suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
        count: 400,
        finalized: false,
        modifiedBy: 'user1@247.ai',
        modified: 1554930400002,
        finalizedBy: '',
      }]
    },
    {
      rollupCluster: 'Cancel_Order',
      count: '655',
      clusters: [{
        clusterId: '1',
        clusterName: 'cancel_order_customer_service', // this is the one getting edited
        originalName: 'cancel_order_customer_service',
        clusterDescription: 'relates to cancel order',
        rollupCluster: 'Cancel_Order',
        suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
        count: 230,
        finalized: false,
        modifiedBy: 'user1@247.ai',
        modified: 1554930400001,
        finalizedBy: '',
      }],
    }
  ];

  const props = {
    clusters: clusterState,
    isOpen: true,
    sortOrder: 'asc',
  };


  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<ClusterList
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });


  describe('Functionality:', () => {
    beforeEach(() => {
      props.handleSorting = jest.fn();
      props.dispatch = jest.fn();
      clusterActions.selectCluster = jest.fn(() => 'action selectCluster');

      wrapper = getShallowWrapper(props);
    });

    describe('onClickVolume', () => {
      test('should call the callback function', () => {
        wrapper.instance().onClickVolume();
        expect(props.handleSorting).toHaveBeenCalled();
      });
    });

    describe('onSelectCluster', () => {
      test('should call the callback function', () => {
        const clusterId = '1234';
        wrapper.instance().onSelectCluster(clusterId);
        expect(clusterActions.selectCluster).toHaveBeenCalledWith(clusterId);
      });
    });
  });
});
