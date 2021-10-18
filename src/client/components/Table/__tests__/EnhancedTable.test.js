import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import EnhancedTable from 'components/Table';
import {
  getColumnVisibility,
  getColumnWidth
} from 'components/Table/EnhancedTable';
import { saveStorage, loadStorage } from '../../../utils/storageManager';

describe('<EnhancedTable />', function () {
  let wrapper;

  const data = [{
    id: 'col1',
    name: 'abc',
    desc: 'desc abc'
  }, {
    id: 'col2',
    name: 'def',
    desc: 'desc def'
  }, {
    id: 'col3',
    name: 'xyz',
    desc: 'desc xyz',
    details: 'more details',
  }];

  const columns = [{
    Header: 'Heading 1',
    accessor: 'col1',
    sortable: true,
    minWidth: 40,
    show: true,
  }, {
    Header: 'Heading 2',
    accessor: 'col2',
    sortable: false,
    show: true,
  }, {
    Header: 'Heading 3',
    accessor: 'col3',
    sortable: true,
    minWidth: 40,
    show: true,
  }];

  const props = {
    tableIndentifier: 'test-table',
    data,
    columns,
  };

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<EnhancedTable
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly for the given props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with filter button', () => {
      wrapper = getShallowWrapper({ ...props, filterEnabled: true });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    const key = 'testKey';

    const tableState = {
      colId: {
        resizedWidth: 120,
        visible: true,
      }
    };
    afterEach(() => {
      localStorage.clear();
      jest.clearAllMocks();
    });

    describe('saveTableState', () => {
      test('should save the data in localstorage against the given key', () => {
        const testData = { a: 'b' };
        saveStorage(key, testData);
        expect(loadStorage(key)).toEqual(testData);
      });
    });

    describe('getTableState', () => {
      test('should parse and give the data', () => {
        const testData = { a: 'b' };
        saveStorage(key, testData);
        expect(loadStorage(key)).toEqual(testData);
      });

      test('should give empty object should parsing fails', () => {
        const testData = 'abc';
        saveStorage(key, testData);
        expect(loadStorage()).toEqual(null);
      });
    });

    describe('getColumnWidth', () => {
      test('should get the column width from the tableState when present', () => {
        expect(getColumnWidth(tableState, 'colId', 100)).toEqual(tableState.colId.resizedWidth);
      });
      test('should get the provided default width when absent in tableState', () => {
        expect(getColumnWidth(tableState, 'notpresent', 100)).toEqual(100);
      });
    });

    describe('getColumnVisibility', () => {
      test('should get the visibility from the tableState when present', () => {
        expect(getColumnVisibility(tableState, 'colId', false)).toEqual(tableState.colId.visible);
      });
      test('should get the provided default visibility when absent in tableState', () => {
        expect(getColumnVisibility(tableState, 'notpresent', true)).toEqual(true);
      });
    });

    describe('handleTableResizeChange', () => {
      test('should store the resized state in localstorage against column name and table identifier', () => {
        const newResized = [{ id: 'col1', value: 163.46875 }, { id: 'col2', value: 235.515625 }];
        wrapper = getShallowWrapper(props);
        wrapper.instance().handleTableResizeChange(newResized);
        expect(loadStorage(props.tableIndentifier)).toMatchSnapshot();
      });

      test('should not store the resized state in localstorage if resized state is not provided', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().handleTableResizeChange();
        expect(loadStorage(props.tableIndentifier)).toMatchSnapshot();
      });
    });

    describe('handleColumnSelection', () => {
      test('should set toggle the visibility of the column', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().handleColumnSelection('col1');
        expect(loadStorage(props.tableIndentifier)).toMatchSnapshot();
      });
    });
  });
});
