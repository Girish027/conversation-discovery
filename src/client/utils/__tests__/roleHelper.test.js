import * as roleHelper from 'utils/roleHelper';

describe('utils/roleHelper', function () {
  describe('updateRoleConfig', () => {
    test('update with admin config', () => {
      expect(roleHelper.updateRoleConfig('admin')).toMatchSnapshot();
    });

    test('update with viewer config', () => {
      expect(roleHelper.updateRoleConfig('viewer')).toMatchSnapshot();
    });
  });
});