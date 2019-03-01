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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

function getSample() {
  const requestPromiseNative = sinon.stub().returns(Promise.resolve('test'));

  return {
    program: proxyquire('../', {
      'request-promise-native': requestPromiseNative,
    }),
    mocks: {
      requestPromiseNative: requestPromiseNative,
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('should echo message', () => {
  const event = {
    data: {
      myMessage: 'hi',
    },
  };
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.helloWorld(event, callback);

  assert.strictEqual(console.log.callCount, 1);
  assert.deepStrictEqual(console.log.firstCall.args, [event.data.myMessage]);
  assert.strictEqual(callback.callCount, 1);
  assert.deepStrictEqual(callback.firstCall.args, []);
});

it('should say no message was provided', () => {
  const error = new Error('No message defined!');
  const callback = sinon.stub();
  const sample = getSample();
  sample.program.helloWorld({data: {}}, callback);

  assert.strictEqual(callback.callCount, 1);
  assert.deepStrictEqual(callback.firstCall.args, [error]);
});

it('should make a promise request', () => {
  const sample = getSample();
  const event = {
    data: {
      endpoint: 'foo.com',
    },
  };

  return sample.program.helloPromise(event).then(result => {
    assert.deepStrictEqual(sample.mocks.requestPromiseNative.firstCall.args, [
      {uri: 'foo.com'},
    ]);
    assert.strictEqual(result, 'test');
  });
});

it('should return synchronously', () => {
  assert.strictEqual(
    getSample().program.helloSynchronous({
      data: {
        something: true,
      },
    }),
    'Something is true!'
  );
});

it('should throw an error', () => {
  assert.throws(
    () => {
      getSample().program.helloSynchronous({
        data: {
          something: false,
        },
      });
    },
    Error,
    'Something was not true!'
  );
});
