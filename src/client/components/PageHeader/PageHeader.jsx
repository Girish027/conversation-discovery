import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import { PageHeader, ToastNotification, StatusNotification } from '@tfs/ui-components';
import { getPageDetails } from 'utils/PageHeaderHelper';
import Constants from '../../constants';

class PageHeaderWrapper extends PureComponent {
  constructor(props) {
    super(props);

    this.getPageHeaderProps = this.getPageHeaderProps.bind(this);
  }

  getPageHeaderProps() {
    const {
      dispatch, caa, itsBaseUrl, routeName, activeProject, selectedRun,
    } = this.props;
    const { projectName, projectId, projectType } = activeProject.toJS();
    const { runName, runId } = selectedRun.toJS();

    const data = {
      dispatch,
      ...caa,
      itsBaseUrl,
      routeName,
      projectName,
      projectId,
      projectType,
      runName,
      runId
    };

    return getPageDetails(data);
  }

  render() {
    const { title = Constants.pageTitle, breadcrumb = [] } = this.getPageHeaderProps();
    const { header } = this.props;
    const { message, notificationType } = header;

    return (
      <PageHeader
        title={title}
        breadcrumb={breadcrumb}
        styleOverride={
          {
            secondaryNavBar: {
              paddingLeft: '30px'
            }
          }
        }
      >
        {(message && notificationType)
          && (
            <StatusNotification>
              <ToastNotification type={notificationType} styleOverride={{ top: '48px' }}>
                {message}
              </ToastNotification>
            </StatusNotification>
          )
        }
      </PageHeader>
    );
  }
}

PageHeaderWrapper.defaultProps = {
  activeProject: fromJS({}),
  selectedRun: fromJS({}),
  dispatch: () => {},
  itsBaseUrl: '',
  routeName: '',
  caa: {},
  header: {},
};

PageHeaderWrapper.propTypes = {
  caa: PropTypes.object,
  dispatch: PropTypes.func,
  routeName: PropTypes.string,
  itsBaseUrl: PropTypes.string,
  activeProject: PropTypes.object,
  selectedRun: PropTypes.object,
  header: PropTypes.object,
};

export default PageHeaderWrapper;
