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

const sinon = require(`sinon`);
const uuid = require('uuid');
const test = require('ava');
const utils = require('@google-cloud/nodejs-repo-tools');
const proxyquire = require(`proxyquire`).noCallThru();

function getSample () {
  const requestPromiseNative = sinon.stub().returns(Promise.resolve(`test`));

  const firestoreMock = {
    doc: sinon.stub().returnsThis(),
    set: sinon.stub()
  };

  return {
    program: proxyquire(`../`, {
      'request-promise-native': requestPromiseNative,
      '@google-cloud/firestore': sinon.stub().returns(firestoreMock)
    }),
    mocks: {
      firestore: firestoreMock,
      requestPromiseNative: requestPromiseNative
    }
  };
}

test.beforeEach(utils.stubConsole);
test.afterEach.always(utils.restoreConsole);

test.serial('should respond to HTTP POST', t => {
  const sample = getSample();

  const reqMock = {
    query: {},
    body: {
      name: 'foo'
    }
  };

  const resMock = {
    send: sinon.stub()
  };

  sample.program.helloHttp(reqMock, resMock);
  t.true(resMock.send.calledWith('Hello foo!'));
});

test.serial('should respond to HTTP GET', t => {
  const sample = getSample();

  const reqMock = {
    query: {
      name: 'foo'
    },
    body: {}
  };

  const resMock = {
    send: sinon.stub()
  };

  sample.program.helloHttp(reqMock, resMock);
  t.true(resMock.send.calledWith('Hello foo!'));
});

test.serial('should escape XSS', t => {
  const sample = getSample();

  const xssQuery = '<script></script>';
  const reqMock = {
    query: {},
    body: {
      name: xssQuery
    }
  };

  const resMock = {
    send: sinon.stub()
  };

  sample.program.helloHttp(reqMock, resMock);
  t.false(resMock.send.calledWith(xssQuery));
});

test.serial('should monitor Firebase RTDB', t => {
  const sample = getSample();

  const dataId = uuid.v4();
  const resourceId = uuid.v4();

  const data = {
    admin: true,
    delta: {
      id: dataId
    }
  };
  const context = {
    resource: resourceId
  };

  sample.program.helloRTDB(data, context);

  t.true(console.log.firstCall.args[0].includes(resourceId));
  t.deepEqual(console.log.secondCall.args, ['Admin?: true']);
  t.true(console.log.getCall(3).args[0].includes(dataId));
});

test.serial('should monitor Firestore', t => {
  const sample = getSample();

  const resourceId = uuid.v4();

  const context = {
    resource: resourceId
  };
  const data = {
    oldValue: { uuid: uuid.v4() },
    value: { uuid: uuid.v4() }
  };

  sample.program.helloFirestore(data, context);

  t.true(console.log.firstCall.args[0].includes(resourceId));
  t.true(console.log.calledWith(JSON.stringify(data.oldValue, null, 2)));
  t.true(console.log.calledWith(JSON.stringify(data.value, null, 2)));
});

test.serial('should monitor Auth', t => {
  const sample = getSample();

  const userId = uuid.v4();
  const dateString = (new Date()).toISOString();
  const emailString = `${uuid.v4()}@${uuid.v4()}.com`;

  const data = {
    uid: userId,
    metadata: {
      createdAt: dateString
    },
    email: emailString
  };

  sample.program.helloAuth(data, null);

  t.true(console.log.firstCall.args[0].includes(userId));
  t.true(console.log.secondCall.args[0].includes(dateString));
  t.true(console.log.thirdCall.args[0].includes(emailString));
});

test.serial('should monitor Analytics', t => {
  const sample = getSample();

  const date = new Date();
  const data = {
    eventDim: [{
      name: 'my-event',
      timestampMicros: `${date.valueOf()}000`
    }],
    userDim: {
      deviceInfo: {
        deviceModel: 'Pixel'
      },
      geoInfo: {
        city: 'London',
        country: 'UK'
      }
    }
  };

  const context = {
    resource: 'my-resource'
  };

  sample.program.helloAnalytics(data, context);

  t.is(console.log.args[0][0], `Function triggered by the following event: my-resource`);
  t.is(console.log.args[1][0], `Name: my-event`);
  t.is(console.log.args[2][0], `Timestamp: ${date}`);
  t.is(console.log.args[3][0], `Device Model: Pixel`);
  t.is(console.log.args[4][0], `Location: London, UK`);
});

test.serial(`should make a promise request`, (t) => {
  const sample = getSample();
  const data = {
    endpoint: `foo.com`
  };

  return sample.program.helloPromise(data)
    .then((result) => {
      t.deepEqual(sample.mocks.requestPromiseNative.firstCall.args, [{ uri: `foo.com` }]);
      t.is(result, `test`);
    });
});

test.serial(`should return synchronously`, (t) => {
  t.is(getSample().program.helloSynchronous({
    something: true
  }), `Something is true!`);
});

test.serial(`should throw an error`, (t) => {
  t.throws(() => {
    getSample().program.helloSynchronous({
      something: false
    });
  }, Error, `Something was not true!`);
});

test(`should update data in response to Firestore events`, t => {
  const sample = getSample();

  const date = Date.now();
  const data = {
    email: 'me@example.com',
    metadata: {
      createdAt: date
    },
    value: {
      fields: {
        original: {
          stringValue: 'foobar'
        }
      }
    }
  };

  const context = {
    resource: '/documents/some/path'
  };

  sample.program.makeUpperCase(data, context);

  t.true(sample.mocks.firestore.doc.calledWith('some/path'));
  t.true(console.log.calledWith(`Replacing value: foobar --> FOOBAR`));
  t.true(sample.mocks.firestore.set.calledWith({'original': 'FOOBAR'}));
});
