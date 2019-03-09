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

const sinon = require('sinon');
const uuid = require('uuid');
const assert = require('assert');
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require('proxyquire').noCallThru();

function getSample() {
  const nodeFetch = sinon.stub().returns(Promise.resolve('test'));

  const firestoreMock = {
    doc: sinon.stub().returnsThis(),
    set: sinon.stub(),
  };

  return {
    program: proxyquire('../', {
      'node-fetch': nodeFetch,
      '@google-cloud/firestore': sinon.stub().returns(firestoreMock),
    }),
    mocks: {
      firestore: firestoreMock,
      nodeFetch: nodeFetch,
    },
  };
}

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

it('should respond to HTTP POST', () => {
  const sample = getSample();

  const reqMock = {
    query: {},
    body: {
      name: 'foo',
    },
  };

  const resMock = {
    send: sinon.stub(),
  };

  sample.program.helloHttp(reqMock, resMock);
  assert.strictEqual(resMock.send.calledWith('Hello foo!'), true);
});

it('should respond to HTTP GET', () => {
  const sample = getSample();

  const reqMock = {
    query: {
      name: 'foo',
    },
    body: {},
  };

  const resMock = {
    send: sinon.stub(),
  };

  sample.program.helloHttp(reqMock, resMock);
  assert.strictEqual(resMock.send.calledWith('Hello foo!'), true);
});

it('should escape XSS', () => {
  const sample = getSample();

  const xssQuery = '<script></script>';
  const reqMock = {
    query: {},
    body: {
      name: xssQuery,
    },
  };

  const resMock = {
    send: sinon.stub(),
  };

  sample.program.helloHttp(reqMock, resMock);
  assert.strictEqual(resMock.send.calledWith(xssQuery), false);
});

it('should monitor Firebase RTDB', () => {
  const sample = getSample();

  const dataId = uuid.v4();
  const resourceId = uuid.v4();

  const data = {
    admin: true,
    delta: {
      id: dataId,
    },
  };
  const context = {
    resource: resourceId,
  };

  sample.program.helloRTDB(data, context);

  assert.strictEqual(console.log.firstCall.args[0].includes(resourceId), true);
  assert.deepStrictEqual(console.log.secondCall.args, ['Admin?: true']);
  assert.strictEqual(console.log.getCall(3).args[0].includes(dataId), true);
});

it('should monitor Firestore', () => {
  const sample = getSample();

  const resourceId = uuid.v4();

  const context = {
    resource: resourceId,
  };
  const data = {
    oldValue: {uuid: uuid.v4()},
    value: {uuid: uuid.v4()},
  };

  sample.program.helloFirestore(data, context);

  assert.strictEqual(console.log.firstCall.args[0].includes(resourceId), true);
  assert.strictEqual(
    console.log.calledWith(JSON.stringify(data.oldValue, null, 2)),
    true
  );
  assert.strictEqual(
    console.log.calledWith(JSON.stringify(data.value, null, 2)),
    true
  );
});

it('should monitor Auth', () => {
  const sample = getSample();

  const userId = uuid.v4();
  const dateString = new Date().toISOString();
  const emailString = `${uuid.v4()}@${uuid.v4()}.com`;

  const data = {
    uid: userId,
    metadata: {
      createdAt: dateString,
    },
    email: emailString,
  };

  sample.program.helloAuth(data, null);

  assert.strictEqual(console.log.firstCall.args[0].includes(userId), true);
  assert.strictEqual(console.log.secondCall.args[0].includes(dateString), true);
  assert.strictEqual(console.log.thirdCall.args[0].includes(emailString), true);
});

it('should monitor Analytics', () => {
  const sample = getSample();

  const date = new Date();
  const data = {
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
  };

  const context = {
    resource: 'my-resource',
  };

  sample.program.helloAnalytics(data, context);

  assert.strictEqual(
    console.log.args[0][0],
    'Function triggered by the following event: my-resource'
  );
  assert.strictEqual(console.log.args[1][0], 'Name: my-event');
  assert.strictEqual(console.log.args[2][0], `Timestamp: ${date}`);
  assert.strictEqual(console.log.args[3][0], 'Device Model: Pixel');
  assert.strictEqual(console.log.args[4][0], 'Location: London, UK');
});

it('should make a promise request', async () => {
  const sample = getSample();
  const data = {
    endpoint: 'foo.com',
  };

  const result = await sample.program.helloPromise(data);
  assert.deepStrictEqual(sample.mocks.nodeFetch.firstCall.args, ['foo.com']);
  assert.strictEqual(result, 'test');
});

it('should return synchronously', () => {
  assert.strictEqual(
    getSample().program.helloSynchronous({
      something: true,
    }),
    'Something is true!'
  );
});

it('should throw an error', () => {
  assert.throws(
    () => {
      getSample().program.helloSynchronous({
        something: false,
      });
    },
    Error,
    'Something was not true!'
  );
});

it('should update data in response to Firestore events', () => {
  const sample = getSample();

  const date = Date.now();
  const data = {
    email: 'me@example.com',
    metadata: {
      createdAt: date,
    },
    value: {
      fields: {
        original: {
          stringValue: 'foobar',
        },
      },
    },
  };

  const context = {
    resource: '/documents/some/path',
  };

  sample.program.makeUpperCase(data, context);

  assert.strictEqual(sample.mocks.firestore.doc.calledWith('some/path'), true);
  assert.strictEqual(
    console.log.calledWith('Replacing value: foobar --> FOOBAR'),
    true
  );
  assert.strictEqual(
    sample.mocks.firestore.set.calledWith({original: 'FOOBAR'}),
    true
  );
});

it('should listen to Firebase Remote Config events', () => {
  const sample = getSample();

  const data = {
    updateOrigin: 'CONSOLE',
    updateType: 'INCREMENTAL_UPDATE',
    versionNumber: '1',
  };

  sample.program.helloRemoteConfig(data);

  assert.strictEqual(
    console.log.calledWith('Update type: INCREMENTAL_UPDATE'),
    true
  );
  assert.strictEqual(console.log.calledWith('Origin: CONSOLE'), true);
  assert.strictEqual(console.log.calledWith('Version: 1'), true);
});

it('should make async HTTP request', () => {
  const sample = getSample();

  sample.program.helloAsync();
  assert.strictEqual(
    sample.mocks.nodeFetch.calledWith('https://www.example.com'),
    true
  );
});
