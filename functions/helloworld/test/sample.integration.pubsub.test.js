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

// [START functions_pubsub_integration_test]
const assert = require('assert');
const execPromise = require('child-process-promise').exec;
const delay = require('delay');
const path = require('path');
const supertest = require('supertest');
const uuid = require('uuid');

const request = supertest(process.env.BASE_URL || 'http://localhost:8080');
const cwd = path.join(__dirname, '..');

it('helloPubSub: should print a name', async () => {
  const name = uuid.v4();

  const encodedName = Buffer.from(name).toString('base64');
  const pubsubMessage = {data: {data: encodedName}};

  const proc = execPromise(
    `functions-framework --target=helloPubSub --signature-type=event`,
    {timeout: 800, shell: true, cwd: cwd}
  );

  await delay(600);

  // Send HTTP request simulating Pub/Sub message
  // (GCF translates Pub/Sub messages to HTTP requests internally)
  await request
    .post('/')
    .send(pubsubMessage)
    .expect(204);

  const {stdout} = await proc;
  assert(stdout.includes(`Hello, ${name}!`));
}).timeout(1000);

it('helloPubSub: should print hello world', async () => {
  const pubsubMessage = {};

  const proc = execPromise(
    `functions-framework --target=helloPubSub --signature-type=event`,
    {timeout: 800, shell: true, cwd: cwd}
  );

  await delay(600);

  // Send HTTP request simulating Pub/Sub message
  // (GCF translates Pub/Sub messages to HTTP requests internally)
  await request
    .post('/')
    .send({data: pubsubMessage})
    .expect(204);

  const {stdout} = await proc;
  assert(stdout.includes('Hello, World!'));
}).timeout(1000);
// [END functions_pubsub_integration_test]
