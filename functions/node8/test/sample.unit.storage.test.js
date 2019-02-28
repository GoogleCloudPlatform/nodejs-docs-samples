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

// [START functions_storage_unit_test]
const assert = require('assert');
const uuid = require('uuid');
const utils = require('@google-cloud/nodejs-repo-tools');

const helloGCS = require('..').helloGCS;

beforeEach(utils.stubConsole);
afterEach(utils.restoreConsole);

it('helloGCS: should print uploaded message', async () => {
  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    name: filename,
    resourceState: 'exists',
    metageneration: '1',
  };

  // Call tested function and verify its behavior
  await helloGCS(event);
  assert.strictEqual(
    console.log.calledWith(`File ${filename} uploaded.`),
    true
  );
});

it('helloGCS: should print metadata updated message', async () => {
  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    name: filename,
    resourceState: 'exists',
    metageneration: '2',
  };

  // Call tested function and verify its behavior
  await helloGCS(event);
  assert.strictEqual(
    console.log.calledWith(`File ${filename} metadata updated.`),
    true
  );
});

it('helloGCS: should print deleted message', async () => {
  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    name: filename,
    resourceState: 'not_exists',
    metageneration: '3',
  };

  // Call tested function and verify its behavior
  await helloGCS(event);
  assert.strictEqual(console.log.calledWith(`File ${filename} deleted.`), true);
});
// [END functions_storage_unit_test]
