// Copyright 2023 Google LLC
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

const {getFunction} = require('@google-cloud/functions-framework/testing');
const sinon = require('sinon');
const assert = require('assert');
require('..');

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

describe('functions_cloudevent_log_stackdriver', async () => {
  it('processLogEntry: should process log entry', async () => {
    const processLogEntry = getFunction('processLogEntry');
    const json = JSON.stringify({
      protoPayload: {
        methodName: 'method',
        resourceName: 'resource',
        authenticationInfo: {
          principalEmail: 'me@example.com',
        },
      },
    });

    const event = {
      data: {
        message: {data: Buffer.from(json).toString('base64')},
      },
    };

    await processLogEntry(event);

    assert.strictEqual(console.log.calledWith('Method: method'), true);
    assert.strictEqual(console.log.calledWith('Resource: resource'), true);
    assert.strictEqual(
      console.log.calledWith('Initiator: me@example.com'),
      true
    );
  });
});
