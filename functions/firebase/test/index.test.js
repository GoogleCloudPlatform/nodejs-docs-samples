// Copyright 2018 Google LLC
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

describe('functions_firebase_rtdb', () => {
  it('should listen to RTDB', () => {
    const sample = getSample();

    const delta = {
      foo: 'bar',
    };

    const event = {
      delta: delta,
    };
    const context = {
      resource: 'resource',
      auth: {
        admin: true,
      },
    };

    sample.program.helloRTDB(event, context);

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
});

describe('functions_firebase_firestore', () => {
  it('should listen to Firestore', () => {
    const sample = getSample();

    const oldValue = {
      foo: 'bar',
    };
    const value = {
      bar: 'baz',
    };
    const event = {
      oldValue: oldValue,
      value: value,
    };
    const context = {
      resource: 'resource',
      eventType: 'type',
    };

    sample.program.helloFirestore(event, context);

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
});

describe('functions_firebase_auth', () => {
  it('should listen to Auth events', () => {
    const sample = getSample();
    const date = Date.now();
    const event = {
      resource: 'resource',
      uid: 'me',
      email: 'me@example.com',
      metadata: {
        createdAt: date,
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
});

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

describe('functions_firebase_remote_config', () => {
  it('should listen to Remote Config events', () => {
    const sample = getSample();

    const event = {
      updateOrigin: 'CONSOLE',
      updateType: 'INCREMENTAL_UPDATE',
      versionNumber: '1',
    };

    sample.program.helloRemoteConfig(event);

    assert.strictEqual(
      console.log.calledWith('Update type: INCREMENTAL_UPDATE'),
      true
    );
    assert.strictEqual(console.log.calledWith('Origin: CONSOLE'), true);
    assert.strictEqual(console.log.calledWith('Version: 1'), true);
  });
});

describe('functions_firebase_reactive', () => {
  it('should capitalize original value', () => {
    const sample = getSample();

    const value = {
      name: 'foo/documents/bar',
      fields: {
        original: {
          stringValue: 'abc',
        },
      },
    };

    const event = {
      eventType: 'type',
      value: value,
    };

    sample.program.makeUpperCase(event);

    assert.strictEqual(
      console.log.calledWith('Replacing value: abc --> ABC'),
      true
    );
    assert.strictEqual(sample.mocks.firestore.doc.calledWith('bar'), true);
    assert.strictEqual(sample.mocks.firestore.set.callCount, 1);
  });

  it('should do nothing if value is already capitalized', () => {
    const sample = getSample();

    const value = {
      name: 'foo/documents/bar',
      fields: {
        original: {
          stringValue: 'ABC',
        },
      },
    };

    const event = {
      eventType: 'type',
      value: value,
    };

    sample.program.makeUpperCase(event);

    assert.strictEqual(
      console.log.calledWith('Value is already upper-case.'),
      true
    );
    assert.strictEqual(sample.mocks.firestore.set.callCount, 0);
  });
});
