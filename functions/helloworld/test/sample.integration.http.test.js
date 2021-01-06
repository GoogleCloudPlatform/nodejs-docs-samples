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

// [START functions_http_integration_test]
const assert = require('assert');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const requestRetry = require('requestretry');
const uuid = require('uuid');

const PORT = process.env.PORT || 8080;
const BASE_URL = `http://localhost:${PORT}`;
const cwd = path.join(__dirname, '..');

// [END functions_http_integration_test]

describe('functions_helloworld_http HTTP integration test', () => {
  // [START functions_http_integration_test]
  let ffProc;

  // Run the functions-framework instance to host functions locally
  before(() => {
    // exec's 'timeout' param won't kill children of "shim" /bin/sh process
    // Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    ffProc = execPromise(
      `functions-framework --target=helloHttp --signature-type=http --port ${PORT} & sleep 2; kill $!`,
      {shell: true, cwd}
    );
  });

  after(async () => {
    // Wait for the functions framework to stop
    await ffProc;
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
    assert.strictEqual(response.body, 'Hello World!');
  });
});
