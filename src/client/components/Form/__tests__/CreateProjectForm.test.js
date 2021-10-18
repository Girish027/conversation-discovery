import React from 'react';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';

import CreateProjectForm from 'components/Form/CreateProjectForm';

describe('<CreateProjectForm />', function () {
  let wrapper;


  const props = {
    caa: {
      clientId: 'a',
      accountId: 'b',
      appid: 'c'
    },
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<CreateProjectForm
    {...propsObj}
  />);

  const getMountedWrapper = (propsObj) => mount(<CreateProjectForm
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getMountedWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with default props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
    test('renders correctly with formdata when provided', () => {
      wrapper = getShallowWrapper({
        ...props,
        formdata: {
          projectName: 'pro-1',
          projectDescription: 'desc'
        }
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality', function () {
    beforeEach(function () {
      props.saveChanges = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onChange', function () {
      test('should save the changes to value in the form', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().onChange({
          target: {
            name: 'projectName',
            value: 'new proj name'
          }
        });
        expect(props.saveChanges).toHaveBeenCalledWith({
          projectName: 'new proj name'
        });
      });
    });

    describe('onDownloadKeyPress', function () {
      test('should download when Enter is pressed ', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().downloadDatasetTemplate = jest.fn();
        wrapper.instance().onDownloadKeyPress({
          keyCode: 13,
          preventDefault: () => {}
        });
        expect(wrapper.instance().downloadDatasetTemplate).toHaveBeenCalled();
      });

      test('should download when Enter is pressed ', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().downloadDatasetTemplate = jest.fn();
        wrapper.instance().onDownloadKeyPress({
          keyCode: 14,
          preventDefault: () => {}
        });
        expect(wrapper.instance().downloadDatasetTemplate).not.toHaveBeenCalled();
      });
    });
  });
});
