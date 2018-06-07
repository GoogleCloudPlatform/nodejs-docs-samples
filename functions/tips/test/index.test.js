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
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const sample = require(`../`);

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`should demonstrate retry behavior for a promise`, async (t) => {
  // Retry by throwing an error
  t.throws(() => {
    sample.retryPromise({ data: {
      retry: true }
    });
  }, 'Retrying...');

  // Terminate by returning a rejected promise
  await t.throws(
    sample.retryPromise({ data: {} }),
    'Not retrying...'
  );
});

test(`should demonstrate retry behavior for a callback`, (t) => {
  const cb = sinon.stub();
  const err = new Error('Error!');

  // Retry by passing an error to the callback
  sample.retryCallback({ data: {
    retry: true }
  }, cb);
  t.deepEqual(cb.firstCall.args, [err]);

  // Terminate by passing nothing to the callback
  sample.retryCallback({ data: {} }, cb);
  t.deepEqual(cb.secondCall.args, []);
});
