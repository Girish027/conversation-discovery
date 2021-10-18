import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import _ from 'lodash';
import { clusterListStyle } from '../../../styles';
import '../../../styles/collapsible.scss';
import {
  clusterSelectors,
  clusterActions,
} from 'state/clusterState';
import { getPathnameSelector } from 'state/routerState';
import { Button, TableSorter } from '@tfs/ui-components';
import constants from '../../../constants';
import { prepareClusterName } from '../../../utils/stringOperations';

export class ClusterList extends PureComponent {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      isHover: false,
      focusedCluster: '',
    };

    this.onClickVolume = this.onClickVolume.bind(this);
    this.toggleFocus = this.toggleFocus.bind(this);
  }

    onSelectCluster = (clusterId) => {
      const { dispatch } = this.props;
      dispatch(clusterActions.selectCluster(clusterId));
    };

    onClickVolume() {
      const { handleSorting } = this.props;
      handleSorting();
    }

    toggleFocus = (clusterId) => {
      const { isHover } = this.state;
      this.setState({
        isHover: !isHover,
        focusedCluster: clusterId
      });
    }

    getLabelStyle = (clusterId) => {
      const { selectedClusterId } = this.props;
      const { isHover, focusedCluster } = this.state;
      let clusterStyle = {};

      if (selectedClusterId === clusterId) {
        clusterStyle = clusterListStyle.selectedItem;
      } else if (isHover && focusedCluster === clusterId) {
        clusterStyle = clusterListStyle.innerListStyleHover;
      } else {
        clusterStyle = clusterListStyle.innerListStyle;
      }
      return clusterStyle;
    }

    clusterConfig = (clustersList, sortOrder) => {
      if (sortOrder === constants.sortOrder.asc) {
        clustersList.sort((a, b) => a.count - b.count);
      } else if (sortOrder === constants.sortOrder.desc) {
        clustersList.sort((a, b) => b.count - a.count);
      } else {
        clustersList.sort((a, b) => b.count - a.count);
        clustersList.push(...clustersList.splice(clustersList.findIndex((v) => v.topic === constants.OTHER_CLUSTER), 1));
      }
    }

    render() {
      const { sortOrder } = this.props;
      let { clusters: clustersList } = this.props;
      if ((Array.isArray(clustersList)) && clustersList.length > 0) {
        const arr = [];
        clustersList.forEach((element) => {
          const arrays = element.clusters;
          arrays.forEach((el) => {
            const obj = {};
            obj.topic = el.clusterName;
            obj.count = el.count;
            obj.clusterId = el.clusterId;
            arr.push(obj);
          });
        });
        clustersList = arr;
      }
      this.clusterConfig(clustersList, sortOrder);
      return (
        <div>
          <div style={clusterListStyle.headerStyle}>
            <span style={clusterListStyle.headerTopicStyle}>Potential Intents</span>
            <div style={clusterListStyle.seperatorStyle}>
              <Button
                name='volume-btn'
                onClick={this.onClickVolume}
                type='flat'
                styleOverride={clusterListStyle.headerButtonStyle}
              >
                Volume
              </Button>
              <TableSorter sortOrder={sortOrder} />
            </div>
          </div>
          <hr style={clusterListStyle.lineStyle} />
          <ul style={clusterListStyle.ulStyle}>
            {clustersList.map((cluster) => (
              <li key={cluster.clusterId}>
                <div
                  role='button'
                  tabIndex={0}
                  onKeyDown={() => this.onSelectCluster(cluster.clusterId)}
                  onClick={() => this.onSelectCluster(cluster.clusterId)}
                  style={this.getLabelStyle(cluster.clusterId)}
                  onMouseOver={() => this.toggleFocus(cluster.clusterId)}
                  onMouseOut={() => this.toggleFocus(cluster.clusterId)}
                  onFocus={() => {}}
                  onBlur={() => {}}
                >
                  <div style={clusterListStyle.innerLabel}>
                    {prepareClusterName(cluster.topic)}
                  </div>
                  <div style={clusterListStyle.innerSeperatorStyle}>
                    {cluster.count}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
}

ClusterList.propTypes = {
  dispatch: PropTypes.func,
  selectedClusterId: PropTypes.string,
  // TODO: remove the below eslint disable once routeName is used
  // eslint-disable-next-line react/no-unused-prop-types
  routeName: PropTypes.string.isRequired,
  handleSorting: PropTypes.func,
  sortOrder: PropTypes.string,
  clusters: PropTypes.array,
};

ClusterList.defaultProps = {
  dispatch: () => {},
  selectedClusterId: '',
  handleSorting: () => {},
  sortOrder: 'none',
  clusters: [],
};

const mapStateToProps = (state) => ({
  // Note:  controls whether the selectedCluster is highlighted or not.
  // if routeName is TOPIC_REVIEW, it is highlighted/expanded state
  // if routeName is Graph or Flow diagram - it is collapsed
  selectedClusterId: clusterSelectors.getSelectedClusterId(state) || '',
  routeName: getPathnameSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});


export default connect(mapStateToProps, mapDispatchToProps)(ClusterList);
