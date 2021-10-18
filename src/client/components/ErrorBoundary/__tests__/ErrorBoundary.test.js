import React from 'react';
import { mount } from 'enzyme';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

const Something = () => null;

describe('ErrorBoundary', () => {
  test('should display an ErrorMessage if wrapped component throws', () => {
    const wrapper = mount(
      <ErrorBoundary>
        <Something />
      </ErrorBoundary>
    );
    const errorMessage = 'This is a simulated error';
    const expectedDataError = '\\n    in Something (created by ErrorBoundary)\\n    in ErrorBoundary (created by WrapperComponent)\\n    in WrapperComponent';
    const error = new Error(errorMessage);
    wrapper.find(Something).simulateError(error);
    expect(wrapper.find(`[data-error-message="${errorMessage}"]`).length).toEqual(1);
    expect(wrapper.find('div').debug()).toMatch(expectedDataError);
  });
});
