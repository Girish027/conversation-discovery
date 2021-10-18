import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Popover from 'react-tiny-popover';
import _ from 'lodash';
import { List, Map, fromJS } from 'immutable';
import memoizeOne from 'memoize-one';
import FilterTopic from './FilterTopics';
import SearchBox from '../../SearchBox';
import '../../../styles/CollapsibleOuter.scss';
import {
  Filter,
  ContextualActionsBar,
  ContextualActionItem
} from '@tfs/ui-components';
import ClustersList from './ClusterList';
import {
  clusterSelectors,
  clusterActions,
  initialFilterState,
} from 'state/clusterState';
import { runSelectors } from 'state/runsState';

import Constants from 'components/../constants';
import { saveStorage } from '../../../utils/storageManager';
import { sidebarButtonStyle, popoverContainerStyle } from '../../../styles';
import constants from '../../../constants';
import { prepareClusterName } from '../../../utils/stringOperations';

const filterByFinalizeAndOpen = (cluster, filters) => {
  const initialFilters = initialFilterState;
  if (_.isEqual(filters, initialFilters)) {
    return true;
  }
  const isFinalized = cluster.finalized === filters.finalized;
  const isOpen = !cluster.finalized === filters.open;

  return isFinalized || isOpen;
};

const getMatchedClusters = (clusters, searchString) => {
  let clustersList = clusters.toJS();
  const search = searchString.trim().toLowerCase();

  if (search.length > 0) {
    clustersList = clustersList.filter((cluster) => cluster.rollupCluster.toLowerCase().includes(search)
        || prepareClusterName(cluster.clusterName).toLowerCase().includes(search)
    );
  }
  return clustersList;
};

function getFilteredClusters(clusters, count) {
  return [...clusters].sort((a, b) => (parseInt(a.count, 10) < parseInt(b.count, 10) ? 1 : -1)).splice(0, count);
}

function filterBySimilarityAndVolume(filteredClusters, filters, volume, clusters) {
  if (!_.volume) {
    if ({}.hasOwnProperty.call(volume, constants.filterClusterByVolume.volumeByCount) && volume.volumeByCount !== null) {
      filteredClusters = getFilteredClusters(clusters, volume.volumeByCount);
    } else if ({}.hasOwnProperty.call(volume, constants.filterClusterByVolume.volumeByPercent) && volume.volumeByPercent !== null) {
      const topClusters = Math.round([...clusters].length * volume.volumeByPercent / 100);
      filteredClusters = getFilteredClusters(clusters, topClusters);
    }
  }

  filteredClusters = filteredClusters.filter((cluster) => cluster.similarityCutOff >= filters.similarityCutOff);

  return filteredClusters;
}

const getGroupedClusters = memoizeOne((clustersImmutable = List([]), filtersImmutable = List([]), dispatch) => {
  const clusters = clustersImmutable;
  const filters = filtersImmutable.toJS();
  const newClusterList = [];

  const groupedCluster = [];
  let filteredClusters = [...clusters];

  const { volume } = filters;

  filteredClusters = filterBySimilarityAndVolume(filteredClusters, filters, volume, clusters);

  filteredClusters.forEach((val) => {
    const show = filterByFinalizeAndOpen(val, filters);
    if (show) {
      const hasCluster = groupedCluster.find((cluster) => cluster.rollupCluster === val.rollupCluster);
      if (hasCluster) {
        hasCluster.clusters.push(val);
        hasCluster.count += val.count;
      } else {
        groupedCluster.push({
          rollupCluster: val.rollupCluster,
          count: val.count,
          clusters: [val],
        });
      }
      newClusterList.push(val);
      dispatch(clusterActions.setFilteredClusters(newClusterList));
    }
  });
  return groupedCluster;
});

export class ClustersSidebar extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.onSearch = this.onSearch.bind(this);
    this.onClickExpand = this.onClickExpand.bind(this);
    this.handleSorting = this.handleSorting.bind(this);
    this.onClickFilter = this.onClickFilter.bind(this);
    this.handleClosePopover = this.handleClosePopover.bind(this);
    this.getCollapbibleButton = this.getCollapbibleButton.bind(this);

    this.state = {
      clusters: [],
      searchString: '',
      sortOrder: Constants.sortOrder.none,
      isOpen: false,
      isPopoverOpen: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(clusterActions.loadFilter());
    dispatch(clusterActions.getAllClusters());
  }

  static getDerivedStateFromProps(props, state) {
    const { clusters: existingClustersList, searchString } = state;
    const { clusters: newClusters, filters: newFilters, dispatch } = props;

    // This logic is for performing search operation on the clusters which returns filtered clusters(matched clusters)
    const newCluster = searchString ? getMatchedClusters(newClusters, searchString) : newClusters.toJS();
    const existingClusters = [];
    const newState = {};

    const initialFilters = initialFilterState;
    const filters = newFilters.toJS();

    // This logic is for comparing the existing clusters with new clusters(when props changes)
    existingClustersList.forEach((cluster) => {
      existingClusters.push(...cluster.clusters);
    });
    newCluster.sort((a, b) => a.clusterId - b.clusterId);
    existingClusters.sort((a, b) => a.clusterId - b.clusterId);

    if (!_.isEqual(existingClusters, newCluster) || !_.isEqual(filters, initialFilters)) {
      newState.clusters = getGroupedClusters(newCluster, newFilters, dispatch);
    }
    return newState;
  }

  onSearch(searchString) {
    this.setState({
      searchString
    });
  }

  onClickExpand() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  onClickFilter() {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen
    });
  }

  getCollapbibleButton(isOpen) {
    let buttonClass = 'CollapsibleOuter';
    if (isOpen) {
      buttonClass = 'CollapsibleOuter isOpen';
    }

    return (
      <div>
        <span className={buttonClass}>
          {!isOpen
            ? Constants.buttons.expandAll
            : Constants.buttons.collapseAll
          }
        </span>
      </div>
    );
  }

  handleSorting() {
    const { sortOrder } = this.state;
    if (sortOrder !== Constants.sortOrder.asc) {
      this.setState({
        sortOrder: Constants.sortOrder.asc,
      });
      saveStorage(Constants.clusterSort, { sortOrder: Constants.sortOrder.asc });
    } else {
      this.setState({
        sortOrder: Constants.sortOrder.desc,
      });
      saveStorage(Constants.clusterSort, { sortOrder: Constants.sortOrder.desc });
    }
  }

  handleClosePopover() {
    this.setState({
      isPopoverOpen: false
    });
  }

  render() {
    const {
      isOpen, sortOrder, isPopoverOpen, clusters
    } = this.state;

    return (
      <div>
        <div style={{ display: 'flex' }}>
          <SearchBox
            onSearch={this.onSearch}
            placeholder='Find Intents'
            styleOverride={{ width: '90%' }}
          />

          <Popover
            isOpen={isPopoverOpen}
            position={'bottom'}
            align={'start'}
            onClickOutside={this.handleClosePopover}
            containerStyle={popoverContainerStyle}
            content={(
              <FilterTopic />
            )}
          >
            <ContextualActionsBar styleOverride={{ ...sidebarButtonStyle.containerStyle, width: '48%' }}>
              <ContextualActionItem
                right
                icon={Filter}
                onClickAction={this.onClickFilter}
                styleOverride={{ fontSize: '12px', marginRight: '-7px', marginTop: '23px' }}
              >
                FILTER
              </ContextualActionItem>
            </ContextualActionsBar>
          </Popover>
        </div>
        <ClustersList
          isOpen={isOpen}
          clusters={clusters}
          handleSorting={this.handleSorting}
          sortOrder={sortOrder}
        />
      </div>
    );
  }
}

ClustersSidebar.propTypes = {
  dispatch: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  filters: PropTypes.object,
};

ClustersSidebar.defaultProps = {
  dispatch: () => {},
  filters: fromJS(initialFilterState),
};

const mapStateToProps = (state) => {
  const allFilters = clusterSelectors.getFilters(state) || new Map({});
  const selectedRunId = runSelectors.getSelectedRunId(state) || '';
  const filters = allFilters.get(selectedRunId);
  return {
    clusters: clusterSelectors.getClusterList(state) || new List([]),
    filters,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});


export default connect(mapStateToProps, mapDispatchToProps)(ClustersSidebar);
