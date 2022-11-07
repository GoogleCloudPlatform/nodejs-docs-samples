// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');

const getSample = () => {
  const results = [[{}], {}];
  const stream = {
    on: sinon.stub().returnsThis(),
  };
  stream.on.withArgs('end').yields();

  const logging = {
    getEntries: sinon.stub().returns(Promise.resolve(results)),
  };

  return {
    program: proxyquire('../', {
      '@google-cloud/logging': sinon.stub().returns(logging),
    }),
    mocks: {
      logging: logging,
      results: results,
    },
  };
};

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};

beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_log_helloworld', () => {
  it('should write to log', () => {
    const expectedMsg = 'I am a log entry!';
    const res = {end: sinon.stub()};

    getSample().program.helloWorld({}, res);

    assert.strictEqual(console.log.callCount, 1);
    assert.deepStrictEqual(console.log.firstCall.args, [expectedMsg]);
    assert.strictEqual(res.end.callCount, 1);
    assert.deepStrictEqual(res.end.firstCall.args, []);
  });
});
