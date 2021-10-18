import * as PreviewActions from 'utils/PreviewActions';
jest.mock('uuid', () => ({ v4: () => '00000000-0000-0000-0000-000000000000' }));

describe('utils/PreviewActions', function () {
  describe('loadViewInchat', () => {
    test('should call ude loadViewInchat action ', () => {
      expect(PreviewActions.loadViewInchat()).toMatchSnapshot();
    });
  });

  describe('closeWidget', () => {
    test('should call ude closeWidget action ', () => {
      expect(PreviewActions.closeWidget()).toMatchSnapshot();
    });
  });

  describe('removeAllMessages', () => {
    test('should call ude removeAllMessages action ', () => {
      expect(PreviewActions.removeAllMessages()).toMatchSnapshot();
    });
  });

  describe('resetWorkflowTransition', () => {
    test('should call ude resetWorkflowTransition action ', () => {
      expect(PreviewActions.resetWorkflowTransition()).toMatchSnapshot();
    });
  });

  describe('scrolledToTop', () => {
    test('should call ude scrolledToTop action ', () => {
      expect(PreviewActions.scrolledToTop()).toMatchSnapshot();
    });
  });

  describe('addWelcomeMessage', () => {
    test('should call ude addWelcomeMessage action ', () => {
      expect(PreviewActions.addWelcomeMessage()).toMatchSnapshot();
    });
  });

  describe('addCustomUserMessage', () => {
    test('should call ude addCustomUserMessage action ', () => {
      const messageContent = 'Hi Agent';
      expect(PreviewActions.addCustomUserMessage(messageContent)).toMatchSnapshot();
    });
  });

  describe('addCustomAgentMessage', () => {
    test('should call ude addCustomAgentMessage action ', () => {
      const messageContent = 'Hi User';
      expect(PreviewActions.addCustomAgentMessage(messageContent)).toMatchSnapshot();
    });
  });

});