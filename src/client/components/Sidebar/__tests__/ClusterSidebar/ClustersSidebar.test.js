import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { fromJS } from 'immutable';
import { ClustersSidebar } from '../../ClusterSidebar';
import Constants from '../../../../constants';
import { saveStorage, loadStorage } from '../../../../utils/storageManager';

jest.useFakeTimers();


describe('<ClustersSidebar />', () => {
  let wrapper;

  const clusterState = {
    selectedClusterId: '3',
    clusters: [{
      clusterId: '1',
      clusterName: 'cancel_order_customer_service', // this is the one getting edited
      originalName: 'cancel_order_customer_service',
      clusterDescription: 'relates to cancel order',
      rollupCluster: 'Cancel_Order',
      suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
      count: 230,
      finalized: true,
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
      finalized: true,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400002,
      finalizedBy: '',
    }, {
      clusterId: '3',
      clusterName: 'store_close_holiday',
      originalName: 'store_close',
      clusterDescription: 'store closed due to reasons',
      rollupCluster: 'Store_Close',
      suggestedNames: ['merchant_close', 'abcde', 'defg'],
      count: 218,
      finalized: true,
      modifiedBy: 'user1@247.ai',
      modified: 1554930400003,
      finalizedBy: 'user1@247.ai',
    }
    ]
  };

  const props = {
    clusters: fromJS(clusterState.clusters),
  };


  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<ClustersSidebar
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
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onSearch', () => {
      test('should change the state and update local storage when onSearch is called', () => {
        wrapper = getShallowWrapper(props);

        const searchString = 'Order cancel';
        wrapper.instance().onSearch(searchString);
        expect(wrapper.state().searchString).toEqual(searchString);

        saveStorage(Constants.clusterSearchString, searchString);
        expect(loadStorage(Constants.clusterSearchString)).toEqual(searchString);
      });
    });

    describe('onClickExpand', () => {
      test('should change the state when onClickExpand is called', () => {
        wrapper = getShallowWrapper(props);

        wrapper.instance().onClickExpand();
        expect(wrapper.state().isOpen).toEqual(true);

        wrapper.instance().onClickExpand();
        expect(wrapper.state().isOpen).toEqual(false);
      });
    });

    describe('onClickFilter', () => {
      test('should change the state of Popover', () => {
        wrapper = getShallowWrapper(props);

        wrapper.instance().onClickFilter();
        expect(wrapper.state().isPopoverOpen).toEqual(true);

        wrapper.instance().onClickFilter();
        expect(wrapper.state().isPopoverOpen).toEqual(false);
      });
    });

    describe('handleClosePopover', () => {
      test('should change the state of Popover to false', () => {
        wrapper = getShallowWrapper(props);

        wrapper.instance().onClickFilter();
        expect(wrapper.state().isPopoverOpen).toEqual(true);

        wrapper.instance().handleClosePopover();
        expect(wrapper.state().isPopoverOpen).toEqual(false);
      });
    });

    describe('handleSorting', () => {
      test('should change the state of sortOrder', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().handleSorting();
        expect(wrapper.state().sortOrder).toEqual('asc');
        wrapper.instance().handleSorting();
        expect(wrapper.state().sortOrder).toEqual('desc');
      });
    });
  });
});
