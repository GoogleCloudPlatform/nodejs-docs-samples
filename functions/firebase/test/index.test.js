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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

function getSample () {
  const firestoreMock = {
    doc: sinon.stub().returnsThis(),
    set: sinon.stub()
  };

  return {
    program: proxyquire(`../`, {
      '@google-cloud/firestore': sinon.stub().returns(firestoreMock)
    }),
    mocks: {
      firestore: firestoreMock
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`should listen to RTDB`, t => {
  const sample = getSample();

  const delta = {
    foo: 'bar'
  };
  const event = {
    resource: 'resource',
    auth: {
      admin: true
    },
    delta: delta
  };

  sample.program.helloRTDB(event);

  t.true(console.log.calledWith(`Function triggered by change to: resource`));
  t.true(console.log.calledWith(`Admin?: true`));
  t.true(console.log.calledWith(JSON.stringify(delta, null, 2)));
});

test(`should listen to Firestore`, t => {
  const sample = getSample();

  const oldValue = {
    foo: 'bar'
  };
  const value = {
    bar: 'baz'
  };
  const event = {
    resource: 'resource',
    eventType: 'type',
    data: {
      oldValue: oldValue,
      value: value
    }
  };

  sample.program.helloFirestore(event);

  t.true(console.log.calledWith(`Function triggered by event on: resource`));
  t.true(console.log.calledWith(`Event type: type`));
  t.true(console.log.calledWith(JSON.stringify(oldValue, null, 2)));
  t.true(console.log.calledWith(JSON.stringify(value, null, 2)));
});

test(`should listen to Auth events`, t => {
  const sample = getSample();
  const date = Date.now();
  const event = {
    resource: 'resource',
    data: {
      uid: 'me',
      email: 'me@example.com',
      metadata: {
        createdAt: date
      }
    }
  };

  sample.program.helloAuth(event);

  t.true(console.log.calledWith(`Function triggered by change to user: me`));
  t.true(console.log.calledWith(`Created at: ${date}`));
  t.true(console.log.calledWith(`Email: me@example.com`));
});

test.serial('should monitor Analytics', t => {
  const date = new Date();
  const event = {
    data: {
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
    },
    resource: 'my-resource'
  };

  const sample = getSample();
  sample.program.helloAnalytics(event);
  t.is(console.log.args[0][0], `Function triggered by the following event: my-resource`);
  t.is(console.log.args[1][0], `Name: my-event`);
  t.is(console.log.args[2][0], `Timestamp: ${date}`);
  t.is(console.log.args[3][0], `Device Model: Pixel`);
  t.is(console.log.args[4][0], `Location: London, UK`);
});

test(`should update data in response to Firestore events`, t => {
  const sample = getSample();

  const date = Date.now();
  const event = {
    resource: '/documents/some/path',
    data: {
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
    }
  };

  sample.program.makeUpperCase(event);

  t.true(sample.mocks.firestore.doc.calledWith('some/path'));
  t.true(console.log.calledWith(`Replacing value: foobar --> FOOBAR`));
  t.true(sample.mocks.firestore.set.calledWith({'original': 'FOOBAR'}));
});
