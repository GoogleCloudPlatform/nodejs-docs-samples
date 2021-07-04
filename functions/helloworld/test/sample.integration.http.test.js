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
const {exec} = require('child_process');
const {request} = require('gaxios');
const uuid = require('uuid');
const waitPort = require('wait-port');

const PORT = process.env.PORT || 8080;
const BASE_URL = `http://localhost:${PORT}`;

// [END functions_http_integration_test]

describe('functions_helloworld_http HTTP integration test', () => {
  // [START functions_http_integration_test]
  let ffProc;

  // Run the functions-framework instance to host functions locally
  before(async () => {
    ffProc = exec(
      `npx functions-framework --target=helloHttp --signature-type=http --port ${PORT}`
    );
    await waitPort({host: 'localhost', port: PORT});
  });

  after(() => ffProc.kill());

  it('helloHttp: should print a name', async () => {
    const name = uuid.v4();

    const response = await request({
      url: `${BASE_URL}/helloHttp`,
      method: 'POST',
      data: {name},
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data, `Hello ${name}!`);
  });
  // [END functions_http_integration_test]

  it('helloHttp: should print hello world', async () => {
    const response = await request({
      url: `${BASE_URL}/helloHttp`,
      method: 'POST',
      data: {},
    });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data, 'Hello World!');
  });
});
