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

var test = require('ava');
var sinon = require('sinon');
var logSample = require('../../functions/log');

test('should write to log', function (t) {
  var expectedMsg = 'I am a log entry!';
  sinon.spy(console, 'log');

  logSample.helloWorld({
    success: function (result) {
      t.is(result, undefined);
      t.is(console.log.calledOnce, true);
      t.is(console.log.calledWith(expectedMsg), true);
    },
    failure: t.fail
  });

  console.log.restore();
});
