import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import EditRunModal from '../EditRunModal';
import constants from '../../../constants';
import {
  runActions,
} from 'state/runsState';

describe('<EditRunModal />', function () {
  let wrapper;

  const props = {
    runId: 'run-123',
    header: constants.modalInfo.editRun.header,
    formData: {
      runName: 'Test Run',
      runDescription: 'trial',
      numOfClusters: 400,
      numOfTurns: 4,
    }
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<EditRunModal
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
      runActions.editRun = jest.fn(() => 'editRun');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('onSubmit', () => {
      const newData = {
        runName: 'new run name',
        runDescription: 'new desc'
      };
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        formData: newData
      });
      wrapper.instance().onSubmit();
      expect(runActions.editRun).toHaveBeenCalledWith(props.runId, newData);
      expect(props.dispatch).toHaveBeenCalledWith('editRun');
    });

    test('onClickCancel', () => {
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickCancel();
      expect(props.onClickClose).toHaveBeenCalled();
    });

    test('handleOnchange when there is no error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        runName: 'new run name',
        runDescription: 'new run desc'
      };
      wrapper.instance().handleOnchange(newData, []);
      expect(wrapper.state().formData).toBe(newData);
      expect(wrapper.state().isValid).toBe(true);
    });

    test('handleOnchange when there is error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        runName: 'new run name',
        runDescription: 'new run desc'
      };
      wrapper.instance().handleOnchange(newData, ['duplicate run']);
      expect(wrapper.state().isValid).toBe(false);
    });
  });
});
