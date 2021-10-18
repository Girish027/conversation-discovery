import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, KeyboardUtils, StringUtils } from '@tfs/ui-components';
import { styles } from '../../styles/customComponentsStyles';
import constants from '../../constants';

const Card = ({ iconLink, title }) => (
  <div
    role='presentation'
    style={styles.card}
  >
    <img src={iconLink} alt='Application logo' style={styles.icon} />
    <div style={styles.cardTitle}>
      {title}
    </div>
  </div>
);

Card.propTypes = {
  iconLink: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

function LogoutWarningDialog(props) {
  const handleEscapeKey = (event) => {
    if (KeyboardUtils.shouldHandleCancel(event)) {
      const { onClose } = props;
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey, false);
    // clean up after this effect:
    return function cleanup() {
      document.removeEventListener('keydown', handleEscapeKey, false);
    };
  });

  const {
    isOpen,
    onClose,
    iconLink,
    onClickOk,
  } = props;

  const title = StringUtils.titleCase(constants.navbar.title);

  return (
    <Dialog
      size='default'
      isOpen={isOpen}
      headerChildren={`Confirm [24]7ai ${title} Log Out`}
      onClickCancel={onClose}
      onClickClose={onClose}
      onClickOk={onClickOk}
      okVisible
      cancelVisible
      okChildren={'LOG OUT'}
      cancelChildren={'CANCEL'}
      styleOverride={styles.dialog}
    >
      {<Card iconLink={iconLink} title={title} />}
      <div style={styles.text}>
        <p>
          {`Logging out will end your [24]7 ${title} session, but your single sign-on session may still be active.`}
        </p>
        <strong>
          If you have other [24]7ai tools open in other tabs or browsers, you will need to log out of each tool individually.
        </strong>
        <p>
          To protect your privacy, close all browser windows when you have logged out of all tools, especially if you are using a public computer.
        </p>
      </div>
    </Dialog>
  );
}

LogoutWarningDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onClickOk: PropTypes.func.isRequired,
  iconLink: PropTypes.string.isRequired,
};

LogoutWarningDialog.defaultProps = {
  isOpen: false,
};

export default LogoutWarningDialog;
