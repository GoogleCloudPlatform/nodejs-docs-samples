// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var utils = require('../utils');

describe('utils', function () {
  describe('makeHandler', function () {
    it('should throw error', function () {
      var handler = utils.makeHandler();
      var error = new Error('error');
      assert.throws(function () {
        handler(error);
      }, Error, error.message);
    });

    it('should do nothing', function () {
      var callCount = console.log.callCount;
      var handler = utils.makeHandler(false);
      handler();
      assert.equal(console.log.callCount, callCount, 'Console.log was not called');
    });

    it('should pretty print an array', function () {
      var handler = utils.makeHandler(true, 'foo');
      handler(null, [{
        foo: 'utils:bar'
      }, {
        foo: 'utils:bar2'
      }]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['utils:bar\nutils:bar2']);
    });

    it('should pretty print an array with multiple fields', function () {
      var handler = utils.makeHandler(true, ['foo', 'bar']);
      handler(null, [{
        foo: 'utils:bar',
        bar: 'utils:foo'
      }, {
        foo: 'utils:bar2',
        bar: 'utils:foo2'
      }]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['{"foo":"utils:bar","bar":"utils:foo"}\n{"foo":"utils:bar2","bar":"utils:foo2"}']);
    });

    it('should pretty print a single field', function () {
      var handler = utils.makeHandler(true, 'foo');
      handler(null, {
        foo: 'utils:bar'
      });
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['utils:bar']);
    });

    it('should just print', function () {
      var handler = utils.makeHandler();
      handler(null, {
        foo: 'utils:bar'
      });
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, [{
        foo: 'utils:bar'
      }]);
    });
  });
});
