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

describe('functions_log_stackdriver', () => {
  it('processLogEntry: should process log entry', () => {
    const sample = getSample();
    const json = JSON.stringify({
      protoPayload: {
        methodName: 'method',
        resourceName: 'resource',
        authenticationInfo: {
          principalEmail: 'me@example.com',
        },
      },
    });

    const data = {
      data: Buffer.from(json, 'ascii'),
    };

    sample.program.processLogEntry(data);

    assert.strictEqual(console.log.calledWith('Method: method'), true);
    assert.strictEqual(console.log.calledWith('Resource: resource'), true);
    assert.strictEqual(
      console.log.calledWith('Initiator: me@example.com'),
      true
    );
  });
});
