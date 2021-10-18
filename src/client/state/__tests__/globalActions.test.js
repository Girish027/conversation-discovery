import constants from 'components/../constants';
import { downloadResults } from '../globalActions';
import * as FileUtils from 'utils/FileUtils';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as projectsState from 'state/projectsState';
import * as appState from 'state/appState';
import {
  fromJS, List
} from 'immutable';

let store;
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
store = mockStore(fromJS({
  auth: {}
      }));

jest.mock('utils/FileUtils');
jest.mock('state/projectsState');
jest.mock('state/appState');

describe('state/globalActions:', function () {
  beforeAll(() => {
    FileUtils.downloadFile = jest.fn();
    projectsState.getActiveProjectId = jest.fn();
    appState.getCAASelector = jest.fn();
  });

  describe('downloadResults' , function() {

    test('should download File', () => {
      FileUtils.downloadFile.mockReturnValue('downloadFile');
      projectsState.getActiveProjectId.mockReturnValue('getActiveProjectId');
      appState.getCAASelector.mockReturnValue('getCAASelector');
      let runId = 'run-1';
      store.dispatch(downloadResults(constants.serverApiUrls.downloadRun, runId));
      expect(store.getActions()).toMatchSnapshot();
      expect(FileUtils.downloadFile).toHaveBeenCalled();
    });

  });

});