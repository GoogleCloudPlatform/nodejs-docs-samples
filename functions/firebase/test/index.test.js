/**
 * Copyright 2018, Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

function getSample() {
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
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('should listen to RTDB', () => {
  const sample = getSample();

  const delta = {
    foo: 'bar',
  };
  const event = {
    resource: 'resource',
    auth: {
      admin: true,
    },
    delta: delta,
  };

  sample.program.helloRTDB(event);

  assert.strictEqual(
    console.log.calledWith('Function triggered by change to: resource'),
    true
  );
  assert.strictEqual(console.log.calledWith('Admin?: true'), true);
  assert.strictEqual(
    console.log.calledWith(JSON.stringify(delta, null, 2)),
    true
  );
});

it('should listen to Firestore', () => {
  const sample = getSample();

  const oldValue = {
    foo: 'bar',
  };
  const value = {
    bar: 'baz',
  };
  const event = {
    resource: 'resource',
    eventType: 'type',
    data: {
      oldValue: oldValue,
      value: value,
    },
  };

  sample.program.helloFirestore(event);

  assert.strictEqual(
    console.log.calledWith('Function triggered by event on: resource'),
    true
  );
  assert.strictEqual(console.log.calledWith('Event type: type'), true);
  assert.strictEqual(
    console.log.calledWith(JSON.stringify(oldValue, null, 2)),
    true
  );
  assert.strictEqual(
    console.log.calledWith(JSON.stringify(value, null, 2)),
    true
  );
});

it('should listen to Auth events', () => {
  const sample = getSample();
  const date = Date.now();
  const event = {
    resource: 'resource',
    data: {
      uid: 'me',
      email: 'me@example.com',
      metadata: {
        createdAt: date,
      },
    },
  };

  sample.program.helloAuth(event);

  assert.strictEqual(
    console.log.calledWith('Function triggered by change to user: me'),
    true
  );
  assert.strictEqual(console.log.calledWith(`Created at: ${date}`), true);
  assert.strictEqual(console.log.calledWith('Email: me@example.com'), true);
});

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

it('should listen to Remote Config events', () => {
  const sample = getSample();

  const event = {
    data: {
      updateOrigin: 'CONSOLE',
      updateType: 'INCREMENTAL_UPDATE',
      versionNumber: '1',
    },
  };

  sample.program.helloRemoteConfig(event);

  assert.strictEqual(
    console.log.calledWith('Update type: INCREMENTAL_UPDATE'),
    true
  );
  assert.strictEqual(console.log.calledWith('Origin: CONSOLE'), true);
  assert.strictEqual(console.log.calledWith('Version: 1'), true);
});
