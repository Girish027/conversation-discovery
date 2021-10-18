import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import CreateRunModal from '../CreateRun/CreateRunModal';
import constants from '../../../constants';
import {
  runActions,
} from 'state/runsState';
import * as appState from 'state/appState';

jest.mock('state/appState');

describe('<CreateRunModal />', function () {
  let wrapper;


  const props = {
    header: 'Create New Run',
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<CreateRunModal
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

  describe('Functionality:', () => {
    beforeEach(() => {
      props.dispatch = jest.fn();
      props.onClickClose = jest.fn();
      props.onClickOk = jest.fn();
      runActions.createRun = jest.fn(() => 'action createRun');
      appState.setModalIsOpen = jest.fn();
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onSubmitForm', () => {
      test('should dispatch action to create run with right data', () => {
        const initialState = {
          formData: {
            runName: 'Test Run',
            runDescription: 'trial',
            numOfClusters: 400,
            numOfTurns: 4,
          }
        };
        wrapper.setState(initialState);
        wrapper.instance().onSubmit();

        expect(runActions.createRun).toHaveBeenCalledWith({
          ...initialState.formData,
          stopWords: expect.any(String)
        });
        expect(props.dispatch).toHaveBeenCalledWith('action createRun');
      });
    });

    describe('onFormChange', () => {
      test('should change the state when there is no error', () => {
        const data = {
          runName: 'Test Run',
          runDescription: 'trial',
          numOfClusters: 400,
          numOfTurns: 4,
        };
        expect(wrapper.state().formData).toEqual({});
        expect(wrapper.state().isValid).toEqual(false);

        wrapper.instance().onFormChange(data, []);
        expect(wrapper.state().formData).toEqual(data);
        expect(wrapper.state().isValid).toEqual(true);
      });

      test('should not change the state when there is  error', () => {
        const data = {
          runName: 'Test Run',
          runDescription: 'trial',
          numOfClusters: 400,
          numOfTurns: 4,
        };

        const error = [{
          message: 'Name should NOT be shorter than 5 characters'
        }];
        expect(wrapper.state().formData).toEqual({});
        expect(wrapper.state().isValid).toEqual(false);

        wrapper.instance().onFormChange(data, error);
        expect(wrapper.state().formData).toEqual({});
        expect(wrapper.state().isValid).toEqual(false);
      });
    });

    describe('onClickCancel', () => {
      test('should dispatch action to cancel run ', () => {
        appState.setModalIsOpen.mockReturnValue('action setModalIsOpen');
        wrapper.instance().onClickCancel();
        expect(appState.setModalIsOpen).toHaveBeenCalled();
        expect(props.dispatch).toHaveBeenCalledWith('action setModalIsOpen');
      });
    });

    describe('handleGoBackClick', () => {
      test('should dispatch action to go back to create run modal', () => {
        const initialState = {
          formData: {
            runName: 'Test Run',
            runDescription: 'trial',
            numOfClusters: 400,
            numOfTurns: 4,
          }
        };

        const dispatchAction = {
          modalName: constants.modals.createRun,
          formData: initialState.formData,
        };
        appState.setModalIsOpen.mockReturnValue('action setModalIsOpen');
        wrapper.setState(initialState);
        wrapper.instance().handleGoBackClick();

        expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, {
          ...dispatchAction
        });
        expect(props.dispatch).toHaveBeenCalledWith('action setModalIsOpen');
      });
    });

    describe('handleStopWords', () => {
      test('should change the state showStopword', () => {
        expect(wrapper.state().showStopWords).toEqual(false);
        wrapper.instance().handleStopWords();
        expect(wrapper.state().showStopWords).toEqual(true);
      });
    });
  });
});
