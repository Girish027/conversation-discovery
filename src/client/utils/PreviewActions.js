import { v4 as uuidv4 } from 'uuid';

export function loadViewInchat() {
  return {
    actionName: 'LOAD_VIEW_INCHAT',
    actionData: {
      view: 'inchat'
    }
  };
}

export function closeWidget() {
  return {
    actionName: 'CLOSE_WIDGET',
    actionData: {}
  };
}

export function removeAllMessages() {
  return {
    actionName: 'REMOVE_ALL_MESSAGE',
    actionData: {}
  };
}

export function resetWorkflowTransition() {
  return {
    actionName: 'RESET_WORKFLOW_TRANSITION',
    actionData: {}
  };
}

export function addWelcomeMessage() {
  return {
    actionName: 'ADD_SYSTEM_MESSAGE',
    actionData: {
      message: {
        id: uuidv4(),
        from: 'system',
        fromName: 'SYSTEM',
        type: 'text',
        showTime: false,
        content: 'You are talking to a Bot'
      }
    }
  };
}

export function addCustomUserMessage(messageContent) {
  return {
    actionName: 'ADD_USER_MESSAGE',
    actionData: {
      message: {
        id: uuidv4(),
        from: 'user',
        fromName: 'User',
        type: 'text',
        content: messageContent,
      }
    }
  };
}

export function addCustomAgentMessage(messageContent) {
  return {
    actionName: 'ADD_AGENT_MESSAGE',
    actionData: {
      message: {
        id: uuidv4(),
        from: 'agent',
        fromName: 'Bot',
        type: 'text',
        content: messageContent,
      }
    }
  };
}

export function scrolledToTop() {
  return {
    actionName: 'SCROLLED_TO_TOP',
    actionData: {
      scrollFlag: true,
    }
  };
}
