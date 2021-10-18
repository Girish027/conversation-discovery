import DOMUtils from './DOMUtils';
import TimerUtils from './TimerUtils';
import Extend from './Extend';
import * as PreviewActions from './PreviewActions';
import constants from '../constants';

let stateChangecallback = () => {};

const configs = {
  scrollFromBottom: false,
  showPoweredBy247: false,
  showAbout247: false,
  messageBgColor: {
    user: '#EBE9E8',
    agent: '#FFE4D1',
    va: '#FFFFFF',
    notification: '#5595E5'
  },
  i18n: {
    uiStrings: {
      en: {
        CHAT_HEADER_DEFAULT: 'Chat Transcript',
      }
    }
  },
  notifications: {
    audio: {
      checkFocus: true,
      message: '',
      reconciled: '',
      started: ''
    },
    visual: {
      message: '',
      reconciled: '',
      started: ''
    }
  },

};

const _config = Extend({}, configs, {
  workflow: '',
  workflowConfig: {},
  appId: 'default',
  apis: {
    onStateChange: 'onStateChange'
  }
});

window.widgetLoaderInitDone = () => {
  global.sessionStorage.initDone = true;
  global.sessionStorage.widgetOpen = true;
  window._tfs.startInteraction();
};

window.onStateChange = (state) => {
  if (state.widgetState === 'widgetLoaded') {
    global.sessionStorage.widgetOpen = true;
    stateChangecallback();
  }

  if (state.widgetState === 'widgetClosed') {
    global.sessionStorage.widgetOpen = false;
    PreviewManager.setReconfigureRequired(true);
  }
};

class PreviewManager {
  static init() {
    global.sessionStorage.isReconfigureRequired = false;
    global.sessionStorage.initDone = false;
    global.sessionStorage.widgetLoaderLoaded = false;
    global.sessionStorage.widgetOpen = false;

    const widgetLoaderUrl = constants.udeFramework;
    DOMUtils.injectScript(widgetLoaderUrl, () => {
      global.sessionStorage.widgetLoaderLoaded = true;
    }, document, {
      id: 'widget-loader',
      'data-initdone': 'window.widgetLoaderInitDone'
    });
  }

  static getWidgetState() {
    return JSON.parse(global.sessionStorage.widgetOpen);
  }

  static getInitDone() {
    return JSON.parse(global.sessionStorage.initDone);
  }

  static loadWidget(callback = () => {}) {
    stateChangecallback = callback;
    if ((JSON.parse(global.sessionStorage.widgetLoaderLoaded) === true) && window._tfs) {
      PreviewManager.prepareConfigForPreview(_config);
      const previewContainer = document.getElementById('preview-container');
      window._tfs.init(_config, previewContainer);
    } else {
      TimerUtils.requestTimeout(() => {
        PreviewManager.loadWidget(callback);
      }, 1000);
    }
  }

  static reloadWidget(callback = () => {}) {
    stateChangecallback = callback;
    PreviewManager.prepareConfigForPreview(_config);
    const previewContainer = document.getElementById('preview-container');
    if ((JSON.parse(global.sessionStorage.widgetLoaderLoaded) === true) && window._tfs && (JSON.parse(global.sessionStorage.isReconfigureRequired) === true)) {
      window._tfs.reconfigure(_config, previewContainer);
      TimerUtils.requestTimeout(() => {
        window._tfs.startInteraction();
      }, 1000);
    } else {
      TimerUtils.requestTimeout(() => {
        PreviewManager.reloadWidget(callback);
      }, 1000);
    }
  }

  static close() {
    if (JSON.parse(global.sessionStorage.initDone) === true) {
      window._tfs.cleanUp();
    }
  }

  static closeWidget() {
    global.sessionStorage.widgetOpen = false;
  }

  static autoCloseWidget() {
    const closeAction = PreviewActions.closeWidget();
    window._tfs.dispatchAction(closeAction.actionName, closeAction.actionData);
  }

  static setReconfigureRequired(reconfigure) {
    global.sessionStorage.isReconfigureRequired = reconfigure;
  }

  static synthesizeView(actions) {
    if (JSON.parse(global.sessionStorage.initDone) === true) {
      actions.forEach((action) => {
        const actionDetails = PreviewActions[action]();
        window._tfs.dispatchAction(actionDetails.actionName, actionDetails.actionData);
      });
    }
  }

  static synthesizeViewTranscript(conversationTranscript) {
    if ((JSON.parse(global.sessionStorage.initDone) === true) && JSON.parse(global.sessionStorage.widgetOpen) === true) {
      const initAction = PreviewActions.loadViewInchat();
      window._tfs.dispatchAction(initAction.actionName, initAction.actionData);
      const removeAllMessages = PreviewActions.removeAllMessages();
      window._tfs.dispatchAction(removeAllMessages.actionName, removeAllMessages.actionData);
      const addWelcomeMessage = PreviewActions.addWelcomeMessage();
      window._tfs.dispatchAction(addWelcomeMessage.actionName, addWelcomeMessage.actionData);
      conversationTranscript.forEach((conversation) => {
        if (conversation.turn === 0) {
          const actionDetails = PreviewActions.addCustomAgentMessage(conversation.sentenceSet);
          window._tfs.dispatchAction(actionDetails.actionName, actionDetails.actionData);
        } else {
          const actionDetails = PreviewActions.addCustomUserMessage(conversation.sentenceSet);
          window._tfs.dispatchAction(actionDetails.actionName, actionDetails.actionData);
        }
      });
    }
  }

  static triggerSpecificAction(action) {
    if (JSON.parse(global.sessionStorage.initDone) === true) {
      const actionDetails = PreviewActions[action]();
      window._tfs.dispatchAction(actionDetails.actionName, actionDetails.actionData);
    }
  }

  static prepareConfigForPreview(config) {
    config.frontendsService = {
      opts: {
        logger: {
          level: 500,
          flushTrigger: 2000
        },
        configuration: false
      }
    };
  }
}

export default PreviewManager;
