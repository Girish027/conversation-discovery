import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Filter } from '@tfs/ui-components';
import IconButton from 'components/IconButton';

import { saveStorage, loadStorage } from '../../utils/storageManager';

export const getColumnWidth = (tableState = {}, columnId, defaultWidth) => {
  const columnState = tableState[columnId] || {};
  const { resizedWidth = defaultWidth } = columnState;
  return resizedWidth;
};

export const getColumnVisibility = (tableState = {}, columnId, defaultVisiblity) => {
  const columnState = tableState[columnId] || {};
  const { visible = defaultVisiblity } = columnState;
  return visible;
};

export default class EnhancedTable extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.handleTableResizeChange = this.handleTableResizeChange.bind(this);
    this.handleColumnSelection = this.handleColumnSelection.bind(this);
  }

  handleTableResizeChange(newResized) {
    const { tableIndentifier } = this.props;
    let resizedData = {};
    let modifiedData = {};
    let storedTableState = {};

    if (newResized && tableIndentifier) {
      newResized.forEach((column) => {
        const resizedCol = column.id;
        const resizedWidth = column.value;

        resizedData = Object.assign(resizedData, {
          [resizedCol]: {
            activeCol: resizedCol,
            resizing: true,
            resizedWidth,
          },
        });

        storedTableState = loadStorage(tableIndentifier, {});

        if (storedTableState) {
          resizedData = Object.assign({}, {
            [resizedCol]: { ...storedTableState[resizedCol], ...resizedData[resizedCol] },
          });
        }
      });

      modifiedData = Object.assign({}, storedTableState, resizedData);
      // saveTableState(modifiedData, tableIndentifier);
      saveStorage(tableIndentifier, modifiedData);
    }

    return modifiedData;
  }

  // TODO: Column Selector Menu is yet to be implemented.
  // Below is the handler for it.
  handleColumnSelection(columnId) {
    const { tableIndentifier } = this.props;
    const storedTableState = loadStorage(tableIndentifier, {});
    const columnState = storedTableState[columnId] || {};
    const { visible: currentVisibleState = true } = columnState;

    const newColumnState = Object.assign({}, columnState, {
      [columnId]: {
        visible: !currentVisibleState,
      },
    });

    const modifiedData = Object.assign({}, storedTableState, newColumnState);
    saveStorage(tableIndentifier, modifiedData);
    return modifiedData;
  }

  render() {
    const {
      filterEnabled, columns, data, tableStyle, tableIndentifier, defaultPageSize, ...otherProps
    } = this.props;

    return (
      <div className='table-container'>
        <Table
          data-qa={tableIndentifier}
          style={tableStyle}
          data={data}
          columns={columns}
          onResizedChange={this.handleTableResizeChange}
          defaultPageSize={defaultPageSize}
          pageSizeOptions={[5, 10, 15, 20, 25, 30, 50, 100]}
          resizable
          {...otherProps}
        />
        {filterEnabled && (
          <div className='column-selector'>
            <IconButton
              icon={Filter}
              onClick={this.showColumnSelector}
              title='Filter Columns'
            />
          </div>
        )
        }
      </div>
    );
  }
}

EnhancedTable.defaultProps = {
  defaultPageSize: 10,
  minRows: 0,
  resizable: true,
  tableStyle: {},
  filterEnabled: false,
};

EnhancedTable.propTypes = {
  tableIndentifier: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  defaultPageSize: PropTypes.number,
  minRows: PropTypes.number,
  resizable: PropTypes.bool,
  filterEnabled: PropTypes.bool,
  tableStyle: PropTypes.object,
};
