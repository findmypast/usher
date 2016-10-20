/* global describe before after beforeEach it expect sandbox _*/
'use strict';

describe('core/installed-modules', function() {
  let sut;
  let result;
  let input;
  const validInput = {
    platform: 'linux',
    env: {
      'HOME': '/home/user/',
      'USERPROFILE': 'C://home'
    }
  };

  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    sut = require('./installed-modules');
  });
  after(function() {
  });
  describe('installDir', function() {
    before(function() {
      input = _.cloneDeep(validInput);
    });
    describe('win32', function() {
      beforeEach(function() {
        input.platform = 'win32';
        result = sut.installDir(input);
      });
      it('returns win installed modules directory', function() {
        expect(result).to.contain(input.env.USERPROFILE);
      });
    });
    beforeEach(function() {
      result = sut.installDir(input);
    });
    it('returns linux installed modules directory', function() {
      expect(result).to.contain(input.env.HOME);
    });
  });
});
