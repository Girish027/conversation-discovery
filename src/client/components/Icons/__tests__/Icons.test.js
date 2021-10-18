import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CsvIcon from 'components/Icons/CsvIcon';
import AngleLeft from 'components/Icons/AngleLeft';
import AngleRight from 'components/Icons/AngleRight';

describe('Icons', function () {
  let iconWrapper;

  describe('<CsvIcon />', function () {
    test('should render correctly with default props', () => {
      iconWrapper = shallow(<CsvIcon />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });

    test('should render correctly with given props', () => {
      iconWrapper = shallow(<CsvIcon
        height={10}
        width={10}
        fill={'#ffffff'}
      />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });
  });

  describe('<AngleLeft />', function () {
    test('should render correctly with default props', () => {
      iconWrapper = shallow(<AngleLeft />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });

    test('should render correctly with given props', () => {
      iconWrapper = shallow(<AngleLeft
        height={'10px'}
        width={'10px'}
        fill={'#ffffff'}
      />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });
  });

  describe('<AngleRight />', function () {
    test('should render correctly with default props', () => {
      iconWrapper = shallow(<AngleRight />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });

    test('should render correctly with given props', () => {
      iconWrapper = shallow(<AngleRight
        height={'10px'}
        width={'10px'}
        fill={'#ffffff'}
      />);
      expect(toJSON(iconWrapper)).toMatchSnapshot();
    });
  });
});
