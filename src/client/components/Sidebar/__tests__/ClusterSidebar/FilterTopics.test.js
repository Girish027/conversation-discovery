import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { FilterTopics } from '../../ClusterSidebar/FilterTopics';

import { clusterActions } from 'state/clusterState';
import { fromJS } from 'immutable';

describe('<FilterTopics />', () => {
  let wrapper;

  const filterItems = {
    finalized: 'finalized',
    open: 'open',
    similarityCutOff: 'similarityCutOff',
    volume: 'volume'
  };

  const clusterState = {
    initialFilterState: {
      // FILTERS
      finalized: false,
      open: false,
      // filters to be persisted on browser
      similarityCutOff: '',
      volumeByCount: '',
      volumeByPercent: 100,
      flag: { volume: false, similarityCutOff: false },
      selectedTopFilter: 'Count'
    }
  };

  const props = {
    filters: fromJS(clusterState.initialFilterState),
  };
  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<FilterTopics
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
      props.dispatch = jest.fn();
      clusterActions.setFilter = jest.fn(() => 'action setFilter');

      wrapper = getShallowWrapper(props);
    });

    describe('handleInputChange', () => {
      test('should change the state when similairty count is updated', () => {
        expect(wrapper.state().similarityCutOff).toEqual('');
        wrapper.instance().handleInputChange('0.88', filterItems.similarityCutOff);
        expect(wrapper.state().similarityCutOff).toEqual(0.88);
      });

      test('should update the state when volume by count is selected in dropdown', () => {
        wrapper.instance().handleDropDownChange('Count');
        expect(wrapper.state().volume).toEqual({});
        wrapper.instance().handleInputChange('5', filterItems.volume);
        expect(wrapper.state().volume).toEqual({ volumeByCount: 5 });
      });

      test('should update the state when volume by percent is selected in dropdown', () => {
        wrapper.instance().handleDropDownChange('Percent');
        expect(wrapper.state().volume).toEqual({});
        wrapper.instance().handleInputChange('50', filterItems.volume);
        expect(wrapper.state().volume).toEqual({ volumeByPercent: 50 });
      });
    });

    describe('toggleCheckbox', () => {
      test('should change the state of filtered value when finalized is checked', () => {
        wrapper.instance().toggleCheckbox(true, filterItems.finalized);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ finalized: true });
      });

      test('should change the state of filtered value when open is checked', () => {
        wrapper.instance().toggleCheckbox(true, filterItems.open);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ open: true });
      });

      test('should change the state of filtered value when similarity score is checked with some value', () => {
        wrapper.instance().handleInputChange('0.88', filterItems.similarityCutOff);
        wrapper.instance().toggleCheckbox(true, filterItems.similarityCutOff);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ similarityCutOff: 0.88, flag: { volume: false, similarityCutOff: true },
        });
      });

      test('should change the state of filtered value when similarity score is unchecked', () => {
        wrapper.instance().handleInputChange('0.88', filterItems.similarityCutOff);
        wrapper.instance().toggleCheckbox(false, filterItems.similarityCutOff);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ similarityCutOff: '', flag: { volume: false, similarityCutOff: false },
      });
      });

      test('should change the state of filtered value when top volume by count is selected', () => {
        wrapper.setState({ volume: { volumeByCount: 5 }, flag: { volume: true, similarityCutOff: false },
        });
        wrapper.instance().toggleCheckbox(true, filterItems.volume);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ volume: { volumeByCount: 5 }, flag: { volume: true, similarityCutOff: false }, selectedTopFilter: 'Count'
        });
      });

      test('should change the state of filtered value when top volume filter is not selected', () => {
        wrapper.setState({ volume: { volumeByCount: 5 } });
        wrapper.instance().toggleCheckbox(false, filterItems.volume);
        expect(clusterActions.setFilter).toHaveBeenCalledWith({ volume: {}, flag: { volume: false, similarityCutOff: false }, selectedTopFilter: 'Count'
        });
      });
    });

    describe('handleDropDownChange', () => {
      test('filter state change to count', () => {
        wrapper.instance().handleDropDownChange('Count');
        expect(wrapper.state().selectedTopFilter).toEqual('Count');
      });

      test('filter state change to percent', () => {
        wrapper.instance().handleDropDownChange('Percent');
        expect(wrapper.state().selectedTopFilter).toEqual('Percent');
      });
    });
  });
});
