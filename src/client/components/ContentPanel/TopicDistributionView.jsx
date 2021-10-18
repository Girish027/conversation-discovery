import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import memoizeOne from 'memoize-one';
import { fromJS, List, Map } from 'immutable';
import {
  BarChart, Button, ContextualActionItem, ContextualActionsBar, Download
} from '@tfs/ui-components';
import Constants from 'components/../constants';
import Placeholder from 'components/Placeholder';
import PieChart from '../Icons/PieChart';
import { runActions, runSelectors } from 'state/runsState';
import { clusterActions, clusterSelectors, initialFilterState } from 'state/clusterState';
import { downloadResults } from 'state/globalActions';

import { runOverviewStyle, windowStyleTopicDistributionView } from 'styles';
import { logAmplitudeEvent } from '../../utils/amplitudeUtils';
import LoadingIndicator from 'components/LoadingIndicator';
import { projectSelectors } from 'state/projectsState';
import {
  setModalIsOpen, getCAASelector, getRoleConfigSelector, setShowWordCloud
} from 'state/appState';
import { routeNames, getRoute } from 'utils/RouteHelper';
import Language from '../../Language';
import { push } from 'connected-react-router';
import WordCloud from 'components/WordCloud';

// Note: data structure : [['name', 23], ['name2', 435]]
const sortDataDesc = (data) => data.sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0));

const getGraphData = memoizeOne((clustersImmutable = List([]), filteredClusters = List([])) => {
  let clusters = clustersImmutable.toJS();
  const { hAxis, vAxis, wordCloudTermsLable } = Constants.DISTRIBUTION_GRAPH;
  const axis = [hAxis, vAxis, { role: wordCloudTermsLable }];

  let topicData = [];
  clusters = filteredClusters.length > 0 ? filteredClusters : [...clusters];

  if (clusters.length) {
    clusters.forEach((cluster) => {
      const {
        clusterName, count, wordCloudTerms
      } = cluster;

      topicData.push([clusterName, count, wordCloudTerms]);
    });

    topicData = sortDataDesc(topicData);
  }

  return {
    clusters,
    topicData: [axis].concat(topicData),
  };
});

export class TopicDistributionView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clusters: [],
      topicData: [],
      showPieChart: true,
    };

    this.nameIndex = 0;
    this.chartEvents = [
      {
        eventName: 'ready',
        callback: this.onMouseOverCluster,
      },
      {
        eventName: 'select',
        callback: this.onClickGranularBar,
      }];
  }

  static getDerivedStateFromProps(props) {
    const { clusters, filteredClusters } = props;
    return getGraphData(clusters, filteredClusters);
  }

  showWordCloud = (toShow, keyWords = '') => {
    const { dispatch } = this.props;
    dispatch(setShowWordCloud(toShow, keyWords));
  }

  onMouseOverCluster = ({ chartWrapper, google }) => {
    const chart = chartWrapper.getChart();

    google.visualization.events.addListener(chart, 'onmouseover', (e) => {
      // const { row } = e;
      const dataTable = chartWrapper.getDataTable();
      const wordsWithSS = dataTable.getValue(e.row, 2);
      console.warn(`OVER: row number - ${e.row}. Word Cloud Terms - ${wordsWithSS}`);
      this.showWordCloud(true, wordsWithSS);
    });
    google.visualization.events.addListener(chart, 'onmouseout', (e) => {
      // const { row } = e;
      this.showWordCloud(false);
      console.warn(`OUT: row number - ${e.row}`);
    });
  }

  onSelectCluster = (clusterId) => {
    const { dispatch } = this.props;
    dispatch(clusterActions.selectCluster(clusterId));
  }

  onClickGranularBar = ({ chartWrapper }) => {
    const { row } = chartWrapper.getChart().getSelection()[0];
    const {
      clusters, topicData
    } = this.state;

    const selectedCluster = topicData[row + 1][this.nameIndex];
    const clusterInfo = clusters.find(({ clusterName = '' }) => clusterName === selectedCluster) || {};
    this.onSelectCluster(clusterInfo.clusterId);
  }

  toggleGraphType = () => {
    const { showPieChart } = this.state;
    const graphObj = { toolId: Constants.toolName, pieChart: showPieChart, env: Constants.environment };
    if (showPieChart) {
      logAmplitudeEvent('IDT_TogglePieChart', graphObj);
    } else {
      logAmplitudeEvent('IDT_ToggleBarChart', graphObj);
    }
    this.setState({
      showPieChart: !showPieChart,
    });
  }

  downloadRunResults = () => {
    const { dispatch, selectedRunId } = this.props;
    dispatch(downloadResults(Constants.serverApiUrls.downloadRun, selectedRunId));
  }

  onClickOkMarkAsComplete = () => {
    const {
      dispatch, selectedRunId, activeProject, caa, runs: runImmutable
    } = this.props;
    const runs = runImmutable.toJS();
    const { projectId } = activeProject.toJS();
    const runsLength = runs.length;
    const rcnt = runs.filter((run) => (
      run.runId !== selectedRunId && run.runStatus === Constants.status.COMPLETE)
    ).length;
    const newRoute = getRoute(routeNames.DISCOVER_INTENTS, { ...caa, projectId });

    if (rcnt === (runsLength - 1)) {
      const systemProject = {
        projectId,
        isDeleteProject: true
      };
      dispatch(runActions.editRun(selectedRunId, {
        runStatus: Constants.status.COMPLETE,
        runStatusDescription: Language.MODAL_MESSAGES.runComplete,
      }, false, systemProject));
    } else {
      const systemProject = {
        projectId,
        isDeleteProject: false
      };
      dispatch(runActions.editRun(selectedRunId, {
        runStatus: Constants.status.COMPLETE,
        runStatusDescription: Language.MODAL_MESSAGES.runComplete,
      }, false, systemProject));
      dispatch(push(newRoute));
    }
  }

  markAsComplete = () => {
    const { dispatch, selectedRunId, activeProject } = this.props;
    const { projectType } = activeProject.toJS();

    if (projectType === Constants.projects.SYSTEM) {
      dispatch(setModalIsOpen(true, {
        modalName: Constants.modals.confirm,
        confirmMode: true,
        header: Language.MODAL_MESSAGES.markAsComplete,
        message: Language.MODAL_MESSAGES.deleteTranscriptOnComplete,
        onClickOk: this.onClickOkMarkAsComplete,
      }));
    } else {
      dispatch(runActions.editRun(selectedRunId, {
        runStatus: Constants.status.COMPLETE,
        runStatusDescription: Language.MODAL_MESSAGES.runComplete,
      }, false));
    }
  }

  renderPlaceholder = () => (
    <Placeholder>
      <div className='message-default'>
        <LoadingIndicator isHerbie message='Preparing The Distribution Graph' />
      </div>
    </Placeholder>
  )

  renderDistributionGraph = () => {
    const { graphStyle } = runOverviewStyle;
    const {
      topicData, showPieChart
    } = this.state;
    const { graphOptions, chartType } = Constants.DISTRIBUTION_GRAPH;

    return (
      <div style={graphStyle.container}>
        <div style={graphStyle.topPane}>
          {(<Chart
            style={{ paddingRight: '30px' }}
            options={{
              ...graphOptions,
            }}
            loader={this.renderPlaceholder()}
            chartType={showPieChart ? chartType.pieChart : chartType.barChart}
            data={topicData}
            width={(graphStyle.width)}
            height={graphStyle.height}
            chartEvents={this.chartEvents}
          />)}
        </div>
        <div style={graphStyle.bottomPane}>
          <WordCloud />
        </div>
      </div>
    );
  }

  render() {
    const {
      clusters, selectedRun, activeProject, roleConfig
    } = this.props;
    const { showPieChart } = this.state;

    const runDetails = selectedRun ? selectedRun.toJS() : {};
    const currentProject = activeProject ? activeProject.toJS() : {};
    const currentProjectType = (currentProject !== {}) ? currentProject.projectType : undefined;

    return (
      <div style={windowStyleTopicDistributionView}>
        <ContextualActionsBar>

          <ContextualActionItem
            onClickAction={this.toggleGraphType}
            icon={showPieChart ? BarChart : PieChart}
          >
            {showPieChart
              ? Constants.buttons.viewBarChart
              : Constants.buttons.viewPieChart
            }
          </ContextualActionItem>

          <ContextualActionItem
            right
          >
            { roleConfig.markAsComplete ? (
              <Button
                name='mark-complete'
                type='primary'
                onClick={this.markAsComplete}
                disabled={runDetails.runStatus === 'COMPLETE'}
                styleOverride={runOverviewStyle.completeButton}
              >
                {Constants.buttons.markAsComplete}
              </Button>
            ) : null }
          </ContextualActionItem>
          <ContextualActionItem
            icon={Download}
            onClickAction={this.downloadRunResults}
            disabled={currentProjectType === Constants.projects.SYSTEM}
            right
          >
            {Constants.buttons.download}
          </ContextualActionItem>

        </ContextualActionsBar>
        {clusters.size
          ? this.renderDistributionGraph()
          : this.renderPlaceholder()
        }
      </div>
    );
  }
}

TopicDistributionView.propTypes = {
  selectedRunId: PropTypes.string,
  dispatch: PropTypes.func,
  clusters: PropTypes.object,
  // eslint-disable-next-line react/no-unused-prop-types
  filters: PropTypes.object,
  selectedRun: PropTypes.object,
  activeProject: PropTypes.object,
  caa: PropTypes.object.isRequired,
  runs: PropTypes.object,
  roleConfig: PropTypes.object,
};

TopicDistributionView.defaultProps = {
  dispatch: () => { },
  selectedRunId: '',
  clusters: new List([]),
  filters: fromJS(initialFilterState),
  selectedRun: new List([]),
  activeProject: fromJS({}),
  runs: new List([]),
  roleConfig: {},
};

const mapStateToProps = (state) => {
  const allFilters = clusterSelectors.getFilters(state) || new Map({});
  const allFilteredClusters = clusterSelectors.getFilteredClusters(state) || new Map({});
  const selectedRunId = runSelectors.getSelectedRunId(state) || '';
  const filters = allFilters.get(selectedRunId);
  const filteredClusters = allFilteredClusters.get(selectedRunId);
  return {
    selectedRunId,
    clusters: clusterSelectors.getClusterList(state) || new List([]),
    selectedRun: runSelectors.getSelectedRun(state) || new List([]),
    activeProject: projectSelectors.getActiveProject(state),
    filters,
    filteredClusters,
    caa: getCAASelector(state),
    runs: runSelectors.getRunsList(state) || new List([]),
    roleConfig: getRoleConfigSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(TopicDistributionView);
