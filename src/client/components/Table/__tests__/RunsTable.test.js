import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { RunsTable } from 'components/Table/RunsTable';
import { runActions } from 'state/runsState';

describe('<RunsTable />', function () {
  let wrapper;

  const data = [{
    runId: 'run-59da2519-ed17-46ad-8294-1367e287589d',
    projectId: 'pro-be2a948f-3a0d-4c30-fd6e-5157f9278bc2',
    runName: 'test-1564166348646',
    runDescription: 'trial',
    numOfTurns: 4,
    numOfClusters: 400,
    stopWords: '["hello","hilton"]',
    modified: 1564166848680,
    modifiedBy: 'abc@test.com',
    created: 1564166348680,
    createdBy: 'abc@test.com',
    runStatus: 'QUEUED',
    runStatusDescription: 'The run is queued',
    starred: 0
  }, {
    runId: 'run-9dd719a7-4670-4198-5bde-82477be2c5a5',
    projectId: 'pro-be2a948f-3a0d-4c30-fd6e-5157f9278bc2',
    runName: 'test-1564159900138',
    runDescription: 'trial',
    numOfTurns: 4,
    numOfClusters: 400,
    stopWords: '["hello","hilton"]',
    modified: 1564159930153,
    modifiedBy: 'abc@test.com',
    created: 1564159900153,
    createdBy: 'abc@test.com',
    runStatus: 'QUEUED',
    runStatusDescription: 'The run is queued',
    starred: 1
  }];


  const props = {
    data,
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<RunsTable
    {...propsObj}
  />);

  const getMountedWrapper = (propsObj) => mount(<RunsTable
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getMountedWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for the given props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    ['QUEUED', 'IN PROGRESS', 'FAILED', 'READY'].forEach((runStatus) => {
      test('renders the status in the table ', () => {
        wrapper = getShallowWrapper(props);
        const statusWrapper = shallow(
          <div>
            {' '}
            { wrapper.instance().renderRunStatus({ runStatus, runStatusDescription: 'desc' })}
            {' '}
          </div>
        );
        expect(toJSON(statusWrapper)).toMatchSnapshot();
      });
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.dispatch = jest.fn();
      runActions.selectRun = jest.fn(() => 'selectRun');
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('selectRun', () => {
      test('should dispatch an action to select the given run', () => {
        const run = { runId: 'run-123' };
        wrapper.instance().selectRun(run);
        expect(runActions.selectRun).toHaveBeenCalledWith(run.runId);
        expect(props.dispatch).toHaveBeenCalledWith('selectRun');
      });
    });
  });
});
