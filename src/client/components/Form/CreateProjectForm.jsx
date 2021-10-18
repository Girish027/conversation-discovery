import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  TextField, Download, Doc, Button
} from '@tfs/ui-components';
import constants from '../../constants';
import Dropzone from './Dropzone';
import CsvIcon from '../Icons/CsvIcon';
import { shouldHandle } from 'utils/KeyboardUtils';
import { downloadFile } from 'utils/FileUtils';

const ERROR_TYPES = {
  DUPLICATE_PROJECT_NAME: 'DUPLICATE_PROJECT_NAME',
  INVALID_FILE_COLUMNS: 'INVALID_FILE_COLUMNS',
};

export default class CreateProjectForm extends PureComponent {
  constructor(props) {
    super(props);
    this.props = props;
    this.onChange = this.onChange.bind(this);

    this.onDownloadKeyPress = this.onDownloadKeyPress.bind(this);
    this.downloadDatasetTemplate = this.downloadDatasetTemplate.bind(this);
  }

  onChange(event) {
    const { value, name } = event.target;
    const { saveChanges } = this.props;
    saveChanges({ [name]: value });
  }

  onDownloadKeyPress(event) {
    if (shouldHandle(event)) {
      this.downloadDatasetTemplate();
    }
    event.preventDefault();
  }

  downloadDatasetTemplate() {
    const { caa } = this.props;
    const locationUrl = constants.serverApiUrls.downloadTemplate(caa);
    downloadFile(locationUrl);
  }

  render() {
    const {
      error, errorType, saveFile, formdata
    } = this.props;

    const { projectName = '', projectDescription = '' } = formdata;
    return (
      <div>
        <div className='formItem'>
          <div className='labelName'>Name</div>
          <TextField
            type='text'
            name='projectName'
            onChange={this.onChange}
            styleOverride={{
              width: '390px',
            }}
            defaultValue={projectName}
          />
        </div>
        <div className='formItem'>
          <div className='labelName'>Description</div>
          <TextField
            type='text'
            name='projectDescription'
            onChange={this.onChange}
            styleOverride={{
              width: '390px',
            }}
            defaultValue={projectDescription}
          />
        </div>
        <div className='formItem'>
          <div className='labelName'>
            <span> Upload Chat Data File </span>
            <hr />
          </div>
          <Button
            onClick={this.downloadDatasetTemplate}
            onKeyDown={this.onDownloadKeyDown}
            type='flat'
            styleOverride={{
              textDecoration: 'underline',
              fontSize: '12px',
              color: '#313f54',
              fontWeight: 'normal'
            }}
          >
            <Download
              width={15}
              height={15}
              fill='#004c97'
              style={{
                verticalAlign: 'middle',
                paddingRight: '10px',
              }}
            />
            Download the template
          </Button>
          <Dropzone
            accept={'text/csv, application/vnd.ms-excel'}
            icon={CsvIcon}
            acceptedIcon={Doc}
            multiple={false}
            saveFile={saveFile}
            maxSize={constants.maxDatasetFileSize}
          />
          { errorType === ERROR_TYPES.INVALID_FILE_COLUMNS && (
            <span className='warning' style={{ height: '15px' }}>
              { error || null }
            </span>
          )}
        </div>
      </div>
    );
  }
}

CreateProjectForm.propTypes = {
  saveFile: PropTypes.func,
  saveChanges: PropTypes.func,
  error: PropTypes.string,
  errorType: PropTypes.string,
  caa: PropTypes.object.isRequired,
  formdata: PropTypes.object,
};

CreateProjectForm.defaultProps = {
  saveFile: () => {},
  saveChanges: () => {},
  error: '',
  errorType: '',
  formdata: {},
};
