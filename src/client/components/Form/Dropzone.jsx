import React, { useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

export default function Dropzone(props) {
  const {
    accept,
    saveFile,
    multiple,
    disabled,
    shouldUpload,
    uploadHandler,
    icon: FileIcon,
    acceptedIcon: AcceptIcon,
    acceptStyle,
    activeStyle,
    rejectStyle,
    baseStyle,
  } = props;

  const sizeRestrictions = {};
  if (props.maxSize) {
    sizeRestrictions.maxSize = props.maxSize;
  }
  if (props.minSize) {
    sizeRestrictions.minSize = props.minSize;
  }

  const status = {
    ready: 'ready',
    accepted: 'accepted',
    rejected: 'rejected',
    acceptedFiles: [],
  };

  const state = {
    status: status.ready,
  };

  const eventHandlers = {
    onDrop: useCallback((acceptedFiles) => {
      if (acceptedFiles.length) {
        state.status = status.accepted;
        state.acceptedFiles = acceptedFiles;
        saveFile(acceptedFiles);

        if (shouldUpload) {
          uploadHandler(acceptedFiles);
        }
      }
    }, [saveFile, shouldUpload, state.acceptedFiles, state.status, status.accepted, uploadHandler]),

    onDropRejected: (rejectedFiles) => {
      state.status = status.rejected;
      state.rejectedFiles = rejectedFiles;
    },

  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    ...eventHandlers,
    accept,
    multiple,
    disabled,
    preventDropOnDocument: true,
    ...sizeRestrictions
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [baseStyle, isDragActive, activeStyle, isDragAccept, acceptStyle, isDragReject, rejectStyle]);

  const renderDetails = (view) => {
    switch (view) {
      case status.ready:
        return `Drag and drop your file
or
BROWSE`;
      case status.accepted: {
        return 'Drop your file here';
      }
      case status.rejected: {
        return `File is not in accepted format.
Please upload ${accept} again.`;
      }
      default: return null;
    }
  };

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <div className='dropzone-content'>
        {acceptedFiles.length > 0
          ? acceptedFiles.map((acceptedFile) => (
            <div key={acceptedFile.name}>
              {AcceptIcon
                ? <AcceptIcon height={49} width={49} fill='#004c97' />
                : null
              }
              <div style={{ paddingTop: '10px', whiteSpace: 'pre-wrap' }}>
                {acceptedFile.name}
              </div>
            </div>
          )) : (
            <div>
              {FileIcon
                ? <FileIcon height={49} width={49} />
                : null
              }
              <div style={{ paddingTop: '10px', whiteSpace: 'pre-wrap' }}>
                {isDragAccept && renderDetails(status.accepted)}
                {isDragReject && renderDetails(status.rejected)}
                {!isDragActive && renderDetails(status.ready)}
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}

const dropzoneStyles = {
  baseStyle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '90px',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  },
  activeStyle: {
    borderColor: '#2196f3'
  },

  acceptStyle: {
    borderColor: '#00e676'
  },

  rejectStyle: {
    borderColor: '#ff1744'
  }
};


Dropzone.propTypes = {
  accept: PropTypes.string.isRequired,
  saveFile: PropTypes.func,
  uploadHandler: PropTypes.func,
  icon: PropTypes.func,
  acceptedIcon: PropTypes.func,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  shouldUpload: PropTypes.bool,
  acceptStyle: PropTypes.object,
  activeStyle: PropTypes.object,
  rejectStyle: PropTypes.object,
  baseStyle: PropTypes.object,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
};

Dropzone.defaultProps = {
  saveFile: () => {},
  uploadHandler: () => {},
  icon: null,
  acceptedIcon: null,
  multiple: false,
  disabled: false,
  shouldUpload: false,
  acceptStyle: dropzoneStyles.acceptStyle,
  activeStyle: dropzoneStyles.activeStyle,
  rejectStyle: dropzoneStyles.rejectStyle,
  baseStyle: dropzoneStyles.baseStyle,
  maxSize: undefined,
  minSize: undefined,
};
