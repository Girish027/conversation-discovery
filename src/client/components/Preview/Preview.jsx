import React, { PureComponent } from 'react';
import { previewStyle } from '../../styles/index';

export default class Preview extends PureComponent {
  render() {
    return (
      <div
        id='preview-container'
        style={previewStyle}
      >
      </div>
    );
  }
}
