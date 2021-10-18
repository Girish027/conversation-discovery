import { downloadFile } from 'utils/FileUtils';
import { getCAASelector } from 'state/appState';
import { getActiveProjectId } from 'state/projectsState';
import Constants from '../constants';
import { logAmplitudeEvent } from '../utils/amplitudeUtils';
import {
  DOWNLOAD_FILE
} from './types';

export const downloadResults = (constructURL, runId, clusterId = '') => (dispatch, getState) => {
  const state = getState();
  const projectId = getActiveProjectId(state);
  const caa = getCAASelector(state);
  const locationUrl = constructURL({
    ...caa, projectId, runId, clusterId
  });
  dispatch({ type: DOWNLOAD_FILE, locationUrl });
  const downloadRun = { toolId: Constants.toolName, runId, env: Constants.environment };
  logAmplitudeEvent('IDT_DownloadRunResults', downloadRun);
  downloadFile(locationUrl);
};
