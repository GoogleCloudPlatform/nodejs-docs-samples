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

const assert = require('assert');
const requestRetry = require('requestretry');
const execPromise = require('child-process-promise').exec;
const path = require('path');

const program = require('..');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const cwd = path.join(__dirname, '..');

let ffProc;

before(() => {
  ffProc = execPromise(
    `functions-framework --target=helloPromise --signature-type=event`,
    {timeout: 2000, shell: true, cwd}
  );
});

after(async () => {
  try {
    await ffProc;
  } catch (err) {
    // Timeouts always cause errors on Linux, so catch them
    if (err.name && err.name === 'ChildProcessError') {
      return;
    }

    throw err;
  }
});

it('should make a promise request', async () => {
  const event = {
    data: {
      endpoint: 'https://example.com',
    },
  };

  const response = await requestRetry({
    url: `${BASE_URL}/`,
    method: 'POST',
    body: event,
    retryDelay: 200,
    json: true,
  });

  assert.strictEqual(response.statusCode, 200);
  assert.ok(response.body.includes(`Example Domain`));
});

it('should return synchronously', () => {
  assert.strictEqual(
    program.helloSynchronous({
      something: true,
    }),
    'Something is true!'
  );
});

it('should throw an error', () => {
  assert.throws(
    () => {
      program.helloSynchronous({
        something: false,
      });
    },
    Error,
    'Something was not true!'
  );
});
