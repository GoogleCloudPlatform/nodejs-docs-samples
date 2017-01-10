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

require(`./_setup`);

var utils = require('../utils');

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial('should throw error', (t) => {
  var handler = utils.makeHandler();
  var error = new Error('error');
  t.throws(() => {
    handler(error);
  }, Error, error.message);
});

test.serial('should do nothing', (t) => {
  var callCount = console.log.callCount;
  var handler = utils.makeHandler(false);
  handler();
  t.is(console.log.callCount, callCount, 'Console.log was not called');
});

test.serial('should pretty print an array', (t) => {
  var handler = utils.makeHandler(true, 'foo');
  handler(null, [{
    foo: 'utils:bar'
  }, {
    foo: 'utils:bar2'
  }]);
  t.is(console.log.calledOnce, true);
  t.deepEqual(console.log.firstCall.args, ['utils:bar\nutils:bar2']);
});

test.serial('should pretty print an array with multiple fields', (t) => {
  var handler = utils.makeHandler(true, ['foo', 'bar']);
  handler(null, [{
    foo: 'utils:bar',
    bar: 'utils:foo'
  }, {
    foo: 'utils:bar2',
    bar: 'utils:foo2'
  }]);
  t.is(console.log.calledOnce, true);
  t.deepEqual(console.log.firstCall.args, ['{"foo":"utils:bar","bar":"utils:foo"}\n{"foo":"utils:bar2","bar":"utils:foo2"}']);
});

test.serial('should pretty print a single field', (t) => {
  var handler = utils.makeHandler(true, 'foo');
  handler(null, {
    foo: 'utils:bar'
  });
  t.is(console.log.calledOnce, true);
  t.deepEqual(console.log.firstCall.args, ['utils:bar']);
});

test.serial('should just print', (t) => {
  var handler = utils.makeHandler();
  handler(null, {
    foo: 'utils:bar'
  });
  t.is(console.log.calledOnce, true);
  t.deepEqual(console.log.firstCall.args, [{
    foo: 'utils:bar'
  }]);
});
