import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import EditClusterModal from '../EditClusterModal';
import constants from '../../../constants';
import {
  clusterActions, editCluster,
} from '../../../state/clusterState';

describe('<EditClusterModal />', function () {
  let wrapper;

  const props = {
    cluserId: 'cluster-123',
    header: constants.modalInfo.editCluster.header,
    formData: {
      clusterName: 'Test Cluster',
      clusterDescription: 'trial',
    }
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<EditClusterModal
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with default props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality', function () {
    beforeEach(function () {
      props.dispatch = jest.fn();
      props.onClickClose = jest.fn();
      clusterActions.editCluster = jest.fn(() => 'editCluster');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('onSubmit', () => {
      const newData = {
        type: 'clusterName',
        clusterName: 'new cluster name',
        clusterDescription: 'new desc'
      };
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        formData: newData
      });
      wrapper.instance().onSubmit();
      expect(clusterActions.editCluster).toHaveBeenCalled();
      expect(props.dispatch).toHaveBeenCalledWith('editCluster');
    });

    test('onClickCancel', () => {
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickCancel();
      expect(props.onClickClose).toHaveBeenCalled();
    });

    test('handleOnchange when there is no error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        clusterName: 'new cluster name',
        clusterDescription: 'new desc'
      };
      wrapper.instance().handleOnchange(newData, []);
      expect(wrapper.state().formData).toBe(newData);
      expect(wrapper.state().isValid).toBe(true);
    });

    test('handleOnchange when there is error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        clusterName: 'new cluster name',
        clusterDescription: 'new desc'
      };
      wrapper.instance().handleOnchange(newData, ['duplicate cluster']);
      expect(wrapper.state().isValid).toBe(false);
    });
  });
});
