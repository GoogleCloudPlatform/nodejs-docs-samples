// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('assert');
const got = require('got');

describe('End-to-End Tests', () => {
  describe('Service-to-service authenticated request', () => {
    const {ID_TOKEN} = process.env;
    if (!ID_TOKEN) {
      throw Error('"ID_TOKEN" environment variable is required.');
    }

    const {BASE_URL} = process.env;
    if (!BASE_URL) {
      throw Error(
        '"BASE_URL" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
      );
    };

    it('Can successfully make a request', async () => {
      const options = {
        prefixUrl: BASE_URL.trim(),
        headers: {
          Authorization: `Bearer ${ID_TOKEN.trim()}`
        },
        retry: 3
      };
      const response = await got('', options);
      assert.strictEqual(response.statusCode, 200);
    });

    it('Can successfully make a request to the Renderer', async () => {
      const options = {
        prefixUrl: BASE_URL.trim(),
        headers: {
          Authorization: `Bearer ${ID_TOKEN.trim()}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        json:  {
          "data": "**markdown**"
        },
        retry: 3
      };
      const response = await got('render', options);
      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, '<p><strong>markdown</strong></p>\n');
    });
  });

});
