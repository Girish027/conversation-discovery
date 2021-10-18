import PreviewManager from '../PreviewManager';
import DOMUtils from '../DOMUtils';
import { JSDOM } from 'jsdom';

global.dom = new JSDOM('<!doctype html><html lang="en"><body></body></html>');
global.window = global.dom.window;
global.window._tfs = {
  init : jest.fn(() => 'init'),
  startInteraction : jest.fn(() => 'startInteraction'),
  cleanUp : jest.fn(() => 'cleanUp'),
  dispatchAction : jest.fn(() => 'dispatchAction'),
  reconfigure : jest.fn(() => 'reconfigure')
};

global.sessionStorage.initDone = true;
global.sessionStorage.widgetOpen = true;
global.sessionStorage.widgetLoaderLoaded = true;
global.sessionStorage.isReconfigureRequired = true;

describe('PreviewManager', function () {

  describe('init', function () {
    beforeEach(() => {
      DOMUtils.injectScript = jest.fn(() => 'injectScript');
    });
    afterAll(() => {
      jest.clearAllMocks();
    });

    it('init loaded', () => {
      PreviewManager.init();
      expect(DOMUtils.injectScript).toHaveBeenCalled();
    });
  });

  describe('getWidgetState', function () {
    it('getWidgetState called', () => {
      global.sessionStorage.widgetOpen = true;
      expect(PreviewManager.getWidgetState()).toEqual(true);
    });
  });

  describe('getInitDone', function () {
    it('getInitDone called', () => {
      global.sessionStorage.initDone = true;
      expect(PreviewManager.getInitDone()).toEqual(true);
    });
  });

  describe('close', function () {
    it('close called', () => {
      PreviewManager.close();
      expect(global.window._tfs.cleanUp).toHaveBeenCalled();
    });
  });

  describe('setReconfigureRequired', function () {
    beforeEach(() => {
      PreviewManager.setReconfigureRequired = jest.fn(() => 'setReconfigureRequired');
    });
    afterAll(() => {
      jest.clearAllMocks();
    });
    it('setReconfigureRequired called', () => {
      expect(PreviewManager.setReconfigureRequired()).toEqual('setReconfigureRequired');
    });
  });

  describe('synthesizeView', function () {
    it('synthesizeView called', () => {
      const actions = ['addWelcomeMessage'];
      PreviewManager.synthesizeView(actions);
      expect(global.window._tfs.dispatchAction).toHaveBeenCalled();
    });
  });

  describe('autoCloseWidget', function () {
    it('autoCloseWidget called', () => {
      PreviewManager.autoCloseWidget();
      expect(global.window._tfs.dispatchAction).toHaveBeenCalled();
    });
  });

  describe('synthesizeViewTranscript', function () {
    it('synthesizeViewTranscript called', () => {
      const conversationTranscript = [
        {
          clusterId: 'daa11ceb3716f49b6c1cfbf3730a3e22',
          documentId: 'M0Z-wHEBQ5JSb55Vgybh',
          sentenceSet: 'Thanks for chatting in! We look forward to working with you. A member of our team will join the chat shortly. In the meantime, please provide as many details as possible about your request. The more information we have, the faster we can assist with a resolution!$$Hi! Good day! My name is Abeley, how can I help you today',
          sequence: 1,
          transcriptId: '5702L0000068i0tQAA',
          turn: 0
        }
      ];
      PreviewManager.synthesizeViewTranscript(conversationTranscript);
      expect(global.window._tfs.dispatchAction).toHaveBeenCalled();
    });
  });

  describe('triggerSpecificAction', function () {
    it('triggerSpecificAction called', () => {
      const actions = ['addWelcomeMessage'];
      PreviewManager.triggerSpecificAction(actions);
      expect(global.window._tfs.dispatchAction).toHaveBeenCalled();
    });
  });

  describe('loadWidget', function () {
    it('loadWidget called', () => {
      global.sessionStorage.widgetLoaderLoaded = true;
      const callbackFn = () => {};
      PreviewManager.loadWidget(callbackFn);
      expect(global.window._tfs.init).toHaveBeenCalled();
    });
  });

  describe('reloadWidget', function () {
    it('reloadWidget called', () => {
      global.sessionStorage.widgetLoaderLoaded = true;
      global.sessionStorage.isReconfigureRequired = true;
      const callbackFn = () => {};
      PreviewManager.reloadWidget(callbackFn);
      expect(global.window._tfs.reconfigure).toHaveBeenCalled();
    });
  });

});