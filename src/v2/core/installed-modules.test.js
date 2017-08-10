'use strict';

describe('core/installed-modules', () => {
  const sut = require('./installed-modules');;
  let result;
  let input;

  describe('given valid windows process input', () => {
    beforeEach(() => {
      input = {
        platform: 'win32',
        env: {
          'HOME': '/home/user/',
          'USERPROFILE': 'C://home'
        }
      };
      result = sut.installDir(input);
    });

    test('returns win installed modules directory', () => {
      expect(result).toContain(input.env.USERPROFILE);
    });
  });

  describe('given valid linux process input', () => {
    beforeEach(() => {
      input = {
        platform: 'linux',
        env: {
          'HOME': '/home/user/',
          'USERPROFILE': 'C://home'
        }
      };

      result = sut.installDir(input);
    });

    test('returns linux installed modules directory', () => {
      expect(result).toContain(input.env.HOME);
    });
  });
});
