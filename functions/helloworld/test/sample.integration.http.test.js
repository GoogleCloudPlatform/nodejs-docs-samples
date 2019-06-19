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

// [START functions_http_integration_test]
const assert = require('assert');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const requestRetry = require('requestretry');
const uuid = require('uuid');

const BASE_URL = 'http://localhost:8080';
const cwd = path.join(__dirname, '..');

const handleLinuxFailures = async proc => {
  try {
    return await proc;
  } catch (err) {
    // Timeouts always cause errors on Linux, so catch them
    if (!err.name || err.name !== 'ChildProcessError') {
      throw err;
    } else {
      return proc;
    }
  }
};

// [END functions_http_integration_test]

describe('HTTP integration test', () => {
  // [START functions_http_integration_test]
  let ffProc;

  // Run the functions-framework instance to host functions locally
  before(() => {
    ffProc = execPromise(
      `functions-framework --target=helloHttp --signature-type=http`,
      {timeout: 1000, shell: true, cwd}
    );
  });

  after(async () => {
    // Wait for the functions framework to stop
    await handleLinuxFailures(ffProc);
  });

  it('helloHttp: should print a name', async () => {
    const name = uuid.v4();

    const response = await requestRetry({
      url: `${BASE_URL}/helloHttp`,
      method: 'POST',
      body: {name},
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, `Hello ${name}!`);
  });
  // [END functions_http_integration_test]

  it('helloHttp: should print hello world', async () => {
    const response = await requestRetry({
      url: `${BASE_URL}/helloHttp`,
      method: 'POST',
      body: {},
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, `Hello World!`);
  });
  // [START functions_http_integration_test]
});
// [END functions_http_integration_test]
