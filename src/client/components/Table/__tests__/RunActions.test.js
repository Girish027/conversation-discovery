import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import RunActions from 'components/Table/RunActions';
import { runActions } from 'state/runsState';
import * as appState from 'state/appState';
import * as globalActions from 'state/globalActions';
import Constants from 'components/../constants';

jest.mock('state/globalActions');
jest.mock('state/appState');

describe('<RunActions />', function () {
  let wrapper;

  const props = {
    runName: 'name',
    runDescription: 'desc',
    runId: 'run-123',
    runStatus: 'QUEUED',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<RunActions
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for the given props - status QUEUED', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly for the props - READY', () => {
      wrapper = getShallowWrapper({ ...props, runStatus: 'READY' });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly for the props - FAILED', () => {
      wrapper = getShallowWrapper({ ...props, runStatus: 'FAILED' });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly for the props - IN PROGRESS', () => {
      wrapper = getShallowWrapper({ ...props, runStatus: 'IN PROGRESS' });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(function () {
      props.dispatch = jest.fn();
      runActions.deleteRun = jest.fn(() => 'deleteRun');
      globalActions.downloadResults = jest.fn();
      appState.setModalIsOpen = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('onClickEdit', () => {
      const event = {
        stopPropagation: () => {}
      };
      appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickEdit(event);
      expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, expect.any(Object));
      expect(appState.setModalIsOpen.mock.calls[0][1]).toMatchSnapshot();
      expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
    });

    test('onClickConfirmDelete', () => {
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickConfirmDelete();
      expect(runActions.deleteRun).toHaveBeenCalledWith(props.runId);
      expect(props.dispatch).toHaveBeenCalledWith('deleteRun');
    });

    test('onClickDelete', () => {
      const event = {
        stopPropagation: () => {}
      };
      appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickDelete(event);
      expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, expect.any(Object));
      expect(appState.setModalIsOpen.mock.calls[0][1]).toMatchSnapshot();
      expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
    });

    test('onClickDownload', () => {
      const event = {
        stopPropagation: () => {}
      };
      globalActions.downloadResults.mockReturnValue('downloadResults');
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickDownload(event);
      expect(globalActions.downloadResults).toHaveBeenCalledWith(Constants.serverApiUrls.downloadRun, props.runId);
      expect(props.dispatch).toHaveBeenCalledWith('downloadResults');
    });
  });
});
