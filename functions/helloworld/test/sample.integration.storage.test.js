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

// [START functions_storage_integration_test]
const assert = require('assert');
const delay = require('delay');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const supertest = require('supertest');
const uuid = require('uuid');

const request = supertest(process.env.BASE_URL || 'http://localhost:8080');
const cwd = path.join(__dirname, '..');

it('helloGCS: should print uploaded message', async () => {
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  const data = {
    data: {
      name: filename,
      resourceState: 'exists',
      metageneration: '1',
    },
  };

  const proc = execPromise(
    `functions-framework --target=helloGCS --signature-type=event`,
    {timeout: 800, shell: true, cwd: cwd}
  );

  await delay(600);

  // Send HTTP request simulating GCS change notification
  // (GCF translates GCS notifications to HTTP requests internally)
  await request
    .post('/')
    .send(data)
    .expect(204);

  const {stdout} = await proc;
  assert.ok(stdout.includes(`File ${filename} uploaded.`));
});

it('helloGCS: should print metadata updated message', async () => {
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  const data = {
    data: {
      name: filename,
      resourceState: 'exists',
      metageneration: '2',
    },
  };

  const proc = execPromise(
    `functions-framework --target=helloGCS --signature-type=event`,
    {timeout: 800, shell: true, cwd: cwd}
  );

  await delay(600);

  // Send HTTP request simulating GCS change notification
  // (GCF translates GCS notifications to HTTP requests internally)
  await request
    .post('/')
    .send(data)
    .expect(204);

  const {stdout} = await proc;
  assert.ok(stdout.includes(`File ${filename} metadata updated.`));
});

it('helloGCS: should print deleted message', async () => {
  const filename = uuid.v4(); // Use a unique filename to avoid conflicts

  const data = {
    data: {
      name: filename,
      resourceState: 'not_exists',
      metageneration: '3',
    },
  };

  const proc = execPromise(
    `functions-framework --target=helloGCS --signature-type=event`,
    {timeout: 800, shell: true, cwd: cwd}
  );

  await delay(600);

  // Send HTTP request simulating GCS change notification
  // (GCF translates GCS notifications to HTTP requests internally)
  await request
    .post('/')
    .send(data)
    .expect(204);

  const {stdout} = await proc;
  assert.ok(stdout.includes(`File ${filename} deleted.`));
});
// [END functions_storage_integration_test]
