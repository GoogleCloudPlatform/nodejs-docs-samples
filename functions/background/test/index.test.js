/**
 * Copyright 2017, Google, Inc.
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
  const requestPromiseNative = sinon.stub().returns(Promise.resolve(`test`));

  return {
    program: proxyquire(`../`, {
      'request-promise-native': requestPromiseNative
    }),
    mocks: {
      requestPromiseNative: requestPromiseNative
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`should echo message`, (t) => {
  const event = {
    data: {
      myMessage: `hi`
    }
  };
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.helloWorld(event, callback);

  t.is(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [event.data.myMessage]);
  t.is(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, []);
});

test.serial(`should say no message was provided`, (t) => {
  const error = new Error(`No message defined!`);
  const callback = sinon.stub();
  const sample = getSample();
  sample.program.helloWorld({ data: {} }, callback);

  t.is(callback.callCount, 1);
  t.deepEqual(callback.firstCall.args, [error]);
});

test.serial(`should make a promise request`, (t) => {
  const sample = getSample();
  const event = {
    data: {
      endpoint: `foo.com`
    }
  };

  return sample.program.helloPromise(event)
    .then((result) => {
      t.deepEqual(sample.mocks.requestPromiseNative.firstCall.args, [{ uri: `foo.com` }]);
      t.is(result, `test`);
    });
});

test.serial(`should return synchronously`, (t) => {
  t.is(getSample().program.helloSynchronous({
    data: {
      something: true
    }
  }), `Something is true!`);
});

test.serial(`should throw an error`, (t) => {
  t.throws(() => {
    getSample().program.helloSynchronous({
      data: {
        something: false
      }
    });
  }, Error, `Something was not true!`);
});
