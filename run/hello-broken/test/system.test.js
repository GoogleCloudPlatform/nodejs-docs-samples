// Copyright 2019 Google LLC
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
const request = require('got');
const {resolve} = require('url');

const get = (route, base_url) => {
  const {ID_TOKEN} = process.env;
  if (!ID_TOKEN) {
    throw Error('"ID_TOKEN" environment variable is required.');
  }

  return request(resolve(base_url.trim(), route), {
    headers: {
      Authorization: `Bearer ${ID_TOKEN.trim()}`,
    },
    throwHttpErrors: false,
  });
};

describe('End-to-End Tests', () => {
  const {NAME} = process.env;
  if (!NAME) {
    throw Error('"NAME" environment variable is required. For example: Cosmos');
  }

  describe('Service relying on defaults', () => {
    const {BASE_URL} = process.env;
    if (!BASE_URL) {
      throw Error(
        '"BASE_URL" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
      );
    }

    it('Broken resource fails on any request', async () => {
      const response = await get('/', BASE_URL);
      assert.strictEqual(
        response.statusCode,
        500,
        'Internal service error not found'
      );
    });

    it('Fixed resource falls back to a default value', async () => {
      const response = await get('/improved', BASE_URL);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not fallback to default as expected'
      );
      assert.strictEqual(
        response.body,
        `Hello World!`,
        `Expected fallback "World" not found`
      );
    });
  });

  describe('Service with specified $NAME', () => {
    const {BASE_URL_OVERRIDE} = process.env;
    if (!BASE_URL_OVERRIDE) {
      throw Error(
        '"BASE_URL_OVERRIDE" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
      );
    }

    it('Broken resource uses the NAME override', async () => {
      const response = await get('/', BASE_URL_OVERRIDE);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not use the NAME override'
      );
      assert.strictEqual(
        response.body,
        `Hello ${NAME}!`,
        `Expected override "${NAME}" not found`
      );
    });

    it('Fixed resource uses the NAME override', async () => {
      const response = await get('/improved', BASE_URL_OVERRIDE);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not fallback to default as expected'
      );
      assert.strictEqual(
        response.body,
        `Hello ${NAME}!`,
        `Expected override "${NAME}" not found`
      );
    });
  });
});
