/**
 * Copyright 2018, Google, Inc.
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
const assert = require(`assert`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const sample = require(`../`);
beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('should demonstrate retry behavior for a promise', done => {
  // Retry by throwing an error
  assert.throws(() => {
    sample.retryPromise({
      data: {
        retry: true,
      },
    });
  }, 'Retrying...');

  // Terminate by returning a rejected promise
  sample.retryPromise({data: {}}).then(
    () => {},
    error => {
      assert.strictEqual(error.message, 'Not retrying...');
      done();
    }
  );
});

it('should demonstrate retry behavior for a callback', done => {
  const cb = sinon.stub();
  const err = new Error('Error!');

  // Retry by passing an error to the callback
  sample.retryCallback(
    {
      data: {
        retry: true,
      },
    },
    cb
  );
  assert.deepStrictEqual(cb.firstCall.args, [err]);

  // Terminate by passing nothing to the callback
  sample.retryCallback({data: {}}, cb);
  assert.deepStrictEqual(cb.secondCall.args, []);
  done();
});

it('should call a GCP API', async () => {
  const reqMock = {
    body: {
      topic: process.env.FUNCTIONS_TOPIC,
    },
  };

  const resMock = {
    send: sinon.stub().returnsThis(),
    status: sinon.stub().returnsThis(),
  };

  sample.gcpApiCall(reqMock, resMock);

  // Instead of modifying the sample to return a promise,
  // use a delay here and keep the sample idiomatic
  await new Promise(resolve => setTimeout(resolve, 1000));

  assert.ok(resMock.status.calledOnce);
  assert.ok(resMock.status.calledWith(200));
});
