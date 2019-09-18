// Copyright 2019 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

const assert = require('assert');
const request = require('got');

const get = (route, base_url) => {
  const {ID_TOKEN} = process.env;
  if (!ID_TOKEN) {
    throw Error('"ID_TOKEN" environment variable is required.');
  }

  return request(route, {
    baseUrl: base_url.trim(),
    headers: {
      Authorization: `Bearer ${ID_TOKEN.trim()}`,
    },
    throwHttpErrors: false,
  });
};

describe('End-to-End Tests', () => {
  const {TARGET} = process.env;
  if (!TARGET) {
    throw Error(
      '"TARGET" environment variable is required. For example: Cosmos'
    );
  }

  describe('Default Service', () => {
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

    it('Fixed resource successfully falls back to a default value', async () => {
      const response = await get('/improved', BASE_URL);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not fallback to default as expected'
      );
      assert.strictEqual(
        response.body,
        `Hello ${TARGET}!`,
        `Expected fallback "World" not found`
      );
    });
  });

  describe('Overridden Service', () => {
    const {BASE_URL_OVERRIDE} = process.env;
    if (!BASE_URL_OVERRIDE) {
      throw Error(
        '"BASE_URL_OVERRIDE" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
      );
    }

    it('Broken resource uses the TARGET override', async () => {
      const response = await get('/', BASE_URL_OVERRIDE);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not use the TARGET override'
      );
      assert.strictEqual(
        response.body,
        `Hello ${TARGET}!`,
        `Expected override "${TARGET}" not found`
      );
    });

    it('Fixed resource uses the TARGET override', async () => {
      const response = await get('/improved', BASE_URL_OVERRIDE);
      assert.strictEqual(
        response.statusCode,
        200,
        'Did not fallback to default as expected'
      );
      assert.strictEqual(
        response.body,
        `Hello ${TARGET}!`,
        `Expected override "${TARGET}" not found`
      );
    });
  });
});
