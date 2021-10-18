import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  StatusBadge, DashedSpinner
} from '@tfs/ui-components';
import RunActions from 'components/Table/RunActions';
import { projectActions } from 'state/projectsState';
import EnhancedTable, { getColumnVisibility, getColumnWidth } from 'components/Table/EnhancedTable';
import { runActions } from 'state/runsState';
import { colors } from 'styles';
import { formatTimestamp } from 'utils/DateUtils';
import { shouldHandle } from 'utils/KeyboardUtils';
import Constants from 'components/../constants';
import GenericTooltip from '../Tooltip/Tooltip';
import { loadStorage } from '../../utils/storageManager';
import constants from '../../constants';

export class RunsTable extends Component {
  constructor(props) {
    super(props);
    this.tableIndentifier = 'CFD_Runs_Table';
    this.tableInfo = {
      name: {
        header: 'Name',
        id: 'runName',
      },
      modified: {
        header: 'Modified on',
        id: 'modified',
      },
      status: {
        header: 'Status',
        id: 'runStatus',
      },
      numOfClusters: {
        header: 'Clusters',
        id: 'numOfClusters',
      },
      numOfTurns: {
        header: 'Turns',
        id: 'numOfTurns',
      },
      modifiedBy: {
        header: 'Modified By',
        id: 'modifiedBy',
      },
      description: {
        header: 'Description',
        id: 'runDescription',
      },
      actions: {
        header: 'Actions',
        id: 'actions'
      }
    };
    this.statusCategoryMapping = {
      QUEUED: 'secondary',
      'IN PROGRESS': 'primary',
      FAILED: 'danger',
      READY: 'primary',
      COMPLETE: 'success',
    };
    this.runsTimer = null;
  }

  componentDidUpdate() {
    const { dispatch } = this.props;
    if (!this.runsTimer) {
      this.runsTimer = setInterval(() => {
        dispatch(runActions.updateRunsStatus());
      }, Constants.pollingInterval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.runsTimer);
    this.runsTimer = null;
  }

  onClickStarRun = ({ runId, starred }) => {
    const { dispatch } = this.props;
    dispatch(runActions.editRun(runId, {
      starred: starred ? 0 : 1
    }, false));
  }

  getType = (runStatus) => (
    runStatus === Constants.status.FAILED
      ? 'error'
      : 'info'
  );

  getClickStyle = (runStatus) => (
    ((runStatus === Constants.status.READY) || (runStatus === Constants.status.COMPLETE))
      ? { pointerEvents: 'auto' }
      : { pointerEvents: 'none' }
  );

  get columns() {
    const { dispatch, projectType, roleConfig } = this.props;
    const tableState = loadStorage(this.tableIndentifier, {});

    const columns = [
      {
        Header: <div className='link-text-run'>{this.tableInfo.name.header}</div>,
        accessor: this.tableInfo.name.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.name.id, 140),
        show: getColumnVisibility(tableState, this.tableInfo.name.id, true),
        Cell: ({ original }) => (
          <div
            className='link-text'
            onClick={() => this.selectRun(original)}
            role='button'
            tabIndex={0}
            onKeyDown={(event) => shouldHandle(event) && this.selectRun(original)}
            style={this.getClickStyle(original.runStatus)}
          >
            {original.runName}
          </div>
        )
      },
      {
        Header: this.tableInfo.modified.header,
        accessor: this.tableInfo.modified.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.modified.id, 110),
        show: getColumnVisibility(tableState, this.tableInfo.modified.id, true),
        Cell: ({ original }) => (
          <div>
            {formatTimestamp(original.modified)}

          </div>
        )
      },
      {
        Header: this.tableInfo.status.header,
        accessor: this.tableInfo.status.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.status.id, 140),
        show: getColumnVisibility(tableState, this.tableInfo.status.id, true),
        Cell: ({ original }) => this.renderRunStatus(original),
      },
      {
        Header: this.tableInfo.numOfClusters.header,
        accessor: this.tableInfo.numOfClusters.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.numOfClusters.id, 100),
        show: getColumnVisibility(tableState, this.tableInfo.numOfClusters.id, true),
        Cell: ({ original }) => (
          <div style={{ margin: '1px 20px 0px 0px' }}>
            { original.numOfClusters >= 0
              ? original.numOfClusters : original.runStatus === 'FAILED' ? 'N/A' : (
                <DashedSpinner width={15} height={15} fill={colors.darkText} />
              )
            }
          </div>
        )
      },
      {
        Header: this.tableInfo.numOfTurns.header,
        accessor: this.tableInfo.numOfTurns.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.numOfTurns.id, 85),
        show: getColumnVisibility(tableState, this.tableInfo.numOfTurns.id, true),
      },
      {
        Header: this.tableInfo.modifiedBy.header,
        accessor: this.tableInfo.modifiedBy.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.modifiedBy.id, 150),
        show: getColumnVisibility(tableState, this.tableInfo.modifiedBy.id, true),
      },
      {
        Header: this.tableInfo.description.header,
        accessor: this.tableInfo.description.id,
        sortable: true,
        minWidth: getColumnWidth(tableState, this.tableInfo.description.id, 120),
        show: getColumnVisibility(tableState, this.tableInfo.description.id, true),
      },
      {
        Header: this.tableInfo.actions.header,
        accessor: this.tableInfo.actions.id,
        sortable: false,
        minWidth: getColumnWidth(tableState, this.tableInfo.actions.id, 110),
        Cell: ({ original }) => (
          <RunActions {...original} dispatch={dispatch} projectType={projectType} roleConfig={roleConfig} />
        ),
      },
    ];

    return columns;
  }

  renderRunStatus = ({ runStatus, runStatusDescription }) => {
    const progress = (runStatus === Constants.status.IN_PROGRESS || runStatus === Constants.status.VERIFYING)
      ? {
        type: 'spinner',
      }
      : {};
    return (
      <GenericTooltip content={runStatusDescription} type={this.getType(runStatus)}>
        <div style={{ margin: '0px -5px' }}>
          <StatusBadge
            category={this.statusCategoryMapping[runStatus]}
            label={runStatus}
            onHover={() => { }}
            progress={progress}
            type='badge'
          />
        </div>
      </GenericTooltip>
    );
  }

  selectRun = (run) => {
    const { dispatch, projectId, projectName } = this.props;
    if (projectName === constants.LIVE_DATA_ANALYSIS) {
      dispatch(projectActions.editProject(
        projectId,
        {
          projectName: constants.LIVE_DATA_IN_REVIEW,
          projectStatus: constants.status.IN_REVIEW,
        },
        true,
        run.runId
      ));
    } else {
      dispatch(runActions.selectRun(run.runId));
    }
  }

  render() {
    const { data } = this.props;
    return (
      <EnhancedTable
        tableIndentifier={this.tableIndentifier}
        columns={this.columns}
        data={data}
        tableStyle={{ maxHeight: 'calc(95vh - 150px)' }}
      />
    );
  }
}

RunsTable.propTypes = {
  dispatch: PropTypes.func,
  data: PropTypes.array,
  projectId: PropTypes.string,
  projectName: PropTypes.string,
  projectType: PropTypes.string,
  roleConfig: PropTypes.object,
};

RunsTable.defaultProps = {
  dispatch: () => { },
  data: [],
  projectId: '',
  projectName: '',
  projectType: PropTypes.string,
  roleConfig: {},
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapDispatchToProps)(RunsTable);
