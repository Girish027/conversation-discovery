import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from '@tfs/ui-components';
import { toolTipStyle } from '../../styles/index';

export default class GenericTooltip extends PureComponent {
  render() {
    const {
      content, children, type, direction
    } = this.props;

    return (
      <Tooltip
        content={content}
        type={type}
        direction={direction}
      >
        <div style={toolTipStyle}>
          {children}
        </div>
      </Tooltip>
    );
  }
}

GenericTooltip.propTypes = {
  content: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  direction: PropTypes.string,
};

GenericTooltip.defaultProps = {
  content: '',
  type: 'info',
  direction: 'bottom',
};
