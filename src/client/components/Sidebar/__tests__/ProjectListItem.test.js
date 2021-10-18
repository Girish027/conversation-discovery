import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ProjectListItem from 'components/Sidebar/ProjectListItem';
import * as appState from 'state/appState';
import { projectActions } from 'state/projectsState';

jest.useFakeTimers();
jest.mock('state/appState');

describe('<ProjectListItem />', function () {
  let wrapper;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const project = {
    caaId: '247ai-referencebot-referencebot',
    created: 1563227027435,
    createdBy: 'user@247.ai',
    datasetName: 'test.csv',
    modified: 1563227027435,
    modifiedBy: 'user@247.ai',
    projectDescription: 'project A desc',
    projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
    projectName: 'project A',
    projectStatus: 'QUEUED',
    projectStatusDescription: null,
  };

  const props = {
    caa,
    ...project,
    dispatch: () => {},
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<ProjectListItem
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
  });

  describe('Functionality:', () => {
    beforeAll(() => {
      props.dispatch = jest.fn();
      props.onClickListItem = jest.fn();
      props.onFocusItem = jest.fn();
      projectActions.deleteProject = jest.fn(() => 'deleteProject');
      appState.setModalIsOpen = jest.fn();
    });

    beforeEach(function () {
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onMouseUp', () => {
      test('should set focus to false', () => {
        wrapper.setState({
          focus: true
        });
        wrapper.instance().onMouseUp();
        expect(wrapper.state().focus).toEqual(false);
      });
    });

    describe('onKeyDown', () => {
      test('should call parent method indicating the project item was clicked', () => {
        wrapper.instance().onKeyDown({
          keyCode: 13
        });
        expect(props.onClickListItem).toHaveBeenCalledWith(props.projectId);
      });
    });

    describe('onClickListItem', () => {
      test('should call parent method indicating the project item was clicked', () => {
        wrapper.instance().onClickListItem();
        expect(props.onClickListItem).toHaveBeenCalledWith(props.projectId);
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

      test('onClickDeleteButton', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().onClickDeleteButton();
        expect(projectActions.deleteProject).toHaveBeenCalledWith(props.projectId);
        expect(props.dispatch).toHaveBeenCalledWith('deleteProject');
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
    });

    describe('toggleFocus', () => {
      test('should set toggle focus', () => {
        wrapper.setState({
          focus: true
        });
        wrapper.instance().toggleFocus();
        expect(wrapper.state().focus).toEqual(false);
        wrapper.instance().toggleFocus();
        expect(wrapper.state().focus).toEqual(true);
      });

      test('should indicate to parent that item is in focus', () => {
        wrapper.setState({
          focus: true
        });
        wrapper.instance().toggleFocus();
        expect(props.onFocusItem).toHaveBeenCalledWith(props.projectId, wrapper.state().focus);
      });
    });
  });
});
