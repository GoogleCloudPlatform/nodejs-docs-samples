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

const httpInvocation = (fnUrl, port) => {
  const baseUrl = `http://localhost:${port}`;

  // GET request
  return request({
    method: 'POST',
    data: '<foo>bar</foo>',
    url: `${baseUrl}/${fnUrl}`,
  });
};

describe('index.test.js', () => {
  describe('functions_http_xml parseXML', () => {
    const PORT = 8081;
    let ffProc;

    before(async () => {
      ffProc = await startFF('parseXML', 'http', PORT);
    });

    after(() => ffProc.kill());

    it('parseXML: should parse XML', async () => {
      const response = await httpInvocation('helloGET', PORT);
      assert.strictEqual(response.status, 200);

      const data = response.data;
      assert.deepStrictEqual(data, {foo: 'bar'});
    });
  });
});
