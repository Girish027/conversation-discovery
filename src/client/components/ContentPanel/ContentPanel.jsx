import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { routeNames } from 'utils/RouteHelper';
import ConnectedRunsView from './RunsView';
import ConnectedConversationsView from './ConversationsView';
import ConnectedTopicDistributionView from './TopicDistributionView';
import PreviewManager from '../../utils/PreviewManager';

export default class ContentPanel extends PureComponent {
  componentDidMount() {
    PreviewManager.init();
  }

  render() {
    const { routeName } = this.props;

    switch (routeName) {
      case routeNames.HOME_PAGE:
      case routeNames.DISCOVER_INTENTS:
        return (<ConnectedRunsView />);
      case routeNames.DISTRIBUTION_GRAPH:
        return (<ConnectedTopicDistributionView />);
      case routeNames.TOPIC_REVIEW:
        return (<ConnectedConversationsView />);
      default:
        return (<ConnectedRunsView />);
    }
  }
}

ContentPanel.propTypes = {
  routeName: PropTypes.string.isRequired,
};
