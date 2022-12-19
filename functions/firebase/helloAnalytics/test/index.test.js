// Copyright 2022 Google LLC
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

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');

const getSample = () => {
  const firestoreMock = {
    doc: sinon.stub().returnsThis(),
    set: sinon.stub(),
  };

  return {
    program: proxyquire('../', {
      '@google-cloud/firestore': sinon.stub().returns(firestoreMock),
    }),
    mocks: {
      firestore: firestoreMock,
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

describe('functions_firebase_analytics', () => {
  it('should listen to Analytics events', () => {
    const date = new Date();
    const event = {
      data: {
        eventDim: [
          {
            name: 'my-event',
            timestampMicros: `${date.valueOf()}000`,
          },
        ],
        userDim: {
          deviceInfo: {
            deviceModel: 'Pixel',
          },
          geoInfo: {
            city: 'London',
            country: 'UK',
          },
        },
      },
      resource: 'my-resource',
    };

    const sample = getSample();
    sample.program.helloAnalytics(event);
    assert.strictEqual(
      console.log.args[0][0],
      'Function triggered by the following event: my-resource'
    );
    assert.strictEqual(console.log.args[1][0], 'Name: my-event');
    assert.strictEqual(console.log.args[2][0], `Timestamp: ${date}`);
    assert.strictEqual(console.log.args[3][0], 'Device Model: Pixel');
    assert.strictEqual(console.log.args[4][0], 'Location: London, UK');
  });
});
