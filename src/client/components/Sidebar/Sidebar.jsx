import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { routeNames } from 'utils/RouteHelper';
import ConnectedProjectsSidebar from './ProjectsSidebar';
import ClustersSidebar from 'components/Sidebar/ClusterSidebar';
import IconButton from 'components/IconButton';
import AngleRight from 'components/Icons/AngleRight';
import AngleLeft from 'components/Icons/AngleLeft';

import 'styles/sidebar.scss';

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.state = {
      sidebarOpen: true,
    };
  }

  toggleSidebar() {
    const { sidebarOpen } = this.state;
    this.setState({
      sidebarOpen: !sidebarOpen
    });
  }

  render() {
    const { sidebarOpen } = this.state;
    let sidebarClassName = '';
    if (sidebarOpen) {
      sidebarClassName = 'sidebar-open';
    } else {
      sidebarClassName = 'sidebar-closed';
    }
    return (
      <div className={`sidebar-container ${sidebarClassName}`}>
        { sidebarOpen && (
          <Switch>
            <Route exact path={routeNames.DISTRIBUTION_GRAPH} component={ClustersSidebar} />
            <Route exact path={routeNames.TOPIC_REVIEW} component={ClustersSidebar} />
            <Route exact path={routeNames.DISCOVER_INTENTS} component={ConnectedProjectsSidebar} />
            <Route path={routeNames.HOME_PAGE} component={ConnectedProjectsSidebar} />
          </Switch>

        )}
        <div className={`sidebar-toggle ${sidebarClassName}`}>
          { sidebarOpen ? (
            <IconButton
              onClick={this.toggleSidebar}
              icon={AngleLeft}
              title='Hide Sidebar'
            />
          ) : (
            <IconButton
              onClick={this.toggleSidebar}
              icon={AngleRight}
              title='Show Sidebar'
            />
          )}
        </div>
      </div>
    );
  }
}

export default Sidebar;
