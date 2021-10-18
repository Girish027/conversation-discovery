import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import EditProjectModal from '../EditProjectModal';
import constants from '../../../constants';
import {
  projectActions,
} from '../../../state/projectsState';

describe('<EditProjectModal />', function () {
  let wrapper;

  const props = {
    projectId: 'project-123',
    header: constants.modalInfo.editProject.header,
    formData: {
      projectName: 'Test Project',
      projectDescription: 'This is a test project',
    }
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<EditProjectModal
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
      projectActions.editProject = jest.fn(() => 'editProject');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('onSubmit', () => {
      const newData = {
        projectName: 'new project name',
        projectDescription: 'new project desc'
      };
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        formData: newData
      });
      wrapper.instance().onSubmit();
      expect(projectActions.editProject).toHaveBeenCalledWith(props.projectId, newData);
      expect(props.dispatch).toHaveBeenCalledWith('editProject');
    });

    test('onClickCancel', () => {
      wrapper = getShallowWrapper(props);
      wrapper.instance().onClickCancel();
      expect(props.onClickClose).toHaveBeenCalled();
    });

    test('handleOnchange when there is no error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        projectName: 'new project name',
        projectDescription: 'new project desc'
      };
      wrapper.instance().handleOnchange(newData, []);
      expect(wrapper.state().formData).toBe(newData);
      expect(wrapper.state().isValid).toBe(true);
    });

    test('handleOnchange when there is error', () => {
      wrapper = getShallowWrapper(props);
      const newData = {
        projectName: 'new project name',
        projectDescription: 'new project desc'
      };
      wrapper.instance().handleOnchange(newData, ['duplicate project']);
      expect(wrapper.state().isValid).toBe(false);
    });
  });
});
