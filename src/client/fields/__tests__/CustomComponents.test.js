import CustomComponents from '../CustomComponents';

describe('CustomComponents', function () { 
  test('renders correctly for default props', () => {
    expect(CustomComponents).toMatchSnapshot();
  });
});