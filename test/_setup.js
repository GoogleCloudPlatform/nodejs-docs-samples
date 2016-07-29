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

var assert = require('power-assert');
var sinon = require('sinon');

global.assert = assert;
global.sinon = sinon;

var log = console.log;
var error = console.error;

beforeEach(function () {
  if (process.env.DEBUG) {
    sinon.spy(console, 'error');
    sinon.spy(console, 'log');
  } else {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log', function (a, b, c) {
      if (typeof a === 'string' && a.indexOf('\u001b') !== -1 && typeof b === 'string') {
        log.apply(console, arguments);
      }
    });
  }
});

afterEach(function () {
  console.error.restore();
  console.log.restore();
});
