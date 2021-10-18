import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CreateProjectModal from 'components/Modals/CreateProjectModal';
import { projectActions } from 'state/projectsState';

describe('<CreateProjectModal />', function () {
  let wrapper;
  const datasetFile = new File(['trial'], 'trial.csv', {
    type: 'text/csv',
  });

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const props = {
    caa,
    dispatch: () => {}
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<CreateProjectModal
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
      projectActions.createProject = jest.fn(() => 'action createProject');
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onClickOk', () => {
      test('should dispatch action to create project with right data', () => {
        const currentState = {
          projectName: 'abc',
          projectDescription: 'abc project',
          datasetFile,
          datasetName: 'trial.csv',
        };
        wrapper.setState(currentState);
        wrapper.instance().onClickOk();
        expect(projectActions.createProject).toHaveBeenCalledWith({
          ...caa,
          ...currentState,
        });
        expect(props.dispatch).toHaveBeenCalledWith('action createProject');
      });
    });

    describe('isValid', () => {
      test('should return true when required fields are not empty', () => {
        const currentState = {
          projectName: 'abcde',
          projectDescription: '',
          datasetFile,
          datasetName: 'trial.csv',
        };
        wrapper.setState(currentState);
        expect(wrapper.instance().isValid()).toBe(true);
      });

      test('should return true when required fields are empty', () => {
        const currentState = {
          projectName: '',
          projectDescription: '',
          datasetFile,
          datasetName: 'trial.csv',
        };
        wrapper.setState(currentState);
        expect(wrapper.instance().isValid()).toBe(false);
      });
    });

    describe('saveChanges', () => {
      test('should update state with the changes', () => {
        wrapper.instance().saveChanges({ projectDescription: 'abcd' });
        expect(wrapper.state().projectDescription).toEqual('abcd');
      });
    });

    describe('saveFile', () => {
      let readAsBinaryString;
      const acceptedFiles = [datasetFile];

      beforeEach(() => {
        readAsBinaryString = jest.fn();
        global.FileReader = jest.fn().mockImplementation(() => ({ readAsBinaryString }));
      });

      afterAll(() => {
        global.FileReader.mockRestore();
      });

      test('should read uploaded file as binary string', () => {
        wrapper.instance().saveFile(acceptedFiles);
        expect(readAsBinaryString).toHaveBeenCalledWith(datasetFile);
      });
    });
  });
});
