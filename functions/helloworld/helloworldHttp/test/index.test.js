// Copyright 2022 Google LLC
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

const assert = require('assert');
const {request} = require('gaxios');
const {exec} = require('child_process');
const waitPort = require('wait-port');

const startFF = async (target, signature, port) => {
  const ff = exec(
    `npx functions-framework --target=${target} --signature-type=${signature} --port=${port}`
  );
  await waitPort({host: 'localhost', port});
  return ff;
};

const httpInvocation = (fnUrl, port, data) => {
  const baseUrl = `http://localhost:${port}`;
  if (data) {
    // POST request
    return request({
      url: `${baseUrl}/${fnUrl}`,
      method: 'POST',
      data,
    });
  } else {
    // GET request
    return request({
      url: `${baseUrl}/${fnUrl}`,
    });
  }
};

describe('index.test.js', () => {
  describe('functions_helloworld_http helloHttp', () => {
    const PORT = 8082;
    let ffProc;

    before(async () => {
      ffProc = await startFF('helloHttp', 'http', PORT);
    });

    after(async () => ffProc.kill());

    it('helloHttp: should print a name via GET', async () => {
      const response = await httpInvocation('helloHttp?name=John', PORT);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data, 'Hello John!');
    });

    it('helloHttp: should print a name via POST', async () => {
      const response = await httpInvocation('helloHttp', PORT, {name: 'John'});
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data, 'Hello John!');
    });

    it('helloHttp: should print hello world', async () => {
      const response = await httpInvocation('helloHttp', PORT);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data, 'Hello World!');
    });

    it('helloHttp: should escape XSS', async () => {
      const response = await httpInvocation('helloHttp', PORT, {
        name: '<script>alert(1)</script>',
      });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.includes('<script>'), false);
    });
  });
});
