import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Placeholder extends PureComponent {
  render() {
    const {
      children, styleOverride, ...otherProps
    } = this.props;
    if (children) {
      return (
        <div
          className='vertical-center horizontal-center'
          style={{
            paddingBottom: '20px',
            ...styleOverride
          }}
          {...otherProps}
        >
          {children}
        </div>
      );
    }
    return '';
  }
}

Placeholder.defaultProps = {
  styleOverride: {},
};

Placeholder.propTypes = {
  children: PropTypes.node,
  styleOverride: PropTypes.object,
};

export default Placeholder;
