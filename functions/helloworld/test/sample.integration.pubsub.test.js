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
const path = require('path');
const requestRetry = require('requestretry');
const uuid = require('uuid');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
const cwd = path.join(__dirname, '..');

const handleLinuxFailures = async proc => {
  try {
    return await proc;
  } catch (err) {
    // Timeouts always cause errors on Linux, so catch them
    if (!err.name || err.name !== 'ChildProcessError') {
      throw err;
    } else {
      return proc;
    }
  }
};

// [END functions_pubsub_integration_test]

describe('Pub/Sub integration test', () => {
  // [START functions_pubsub_integration_test]
  it('helloPubSub: should print a name', async () => {
    const name = uuid.v4();

    const encodedName = Buffer.from(name).toString('base64');
    const pubsubMessage = {data: {data: encodedName}};

    const proc = execPromise(
      `functions-framework --target=helloPubSub --signature-type=event`,
      {timeout: 800, shell: true, cwd}
    );

    // Send HTTP request simulating Pub/Sub message
    // (GCF translates Pub/Sub messages to HTTP requests internally)
    const response = await requestRetry({
      url: `${BASE_URL}/`,
      method: 'POST',
      body: pubsubMessage,
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 204);

    // Wait for the functions framework to stop
    const {stdout} = await handleLinuxFailures(proc);

    assert(stdout.includes(`Hello, ${name}!`));
  });
  // [END functions_pubsub_integration_test]

  it('helloPubSub: should print hello world', async () => {
    const pubsubMessage = {data: {}};

    const proc = execPromise(
      `functions-framework --target=helloPubSub --signature-type=event`,
      {timeout: 800, shell: true, cwd}
    );

    // Send HTTP request simulating Pub/Sub message
    // (GCF translates Pub/Sub messages to HTTP requests internally)
    const response = await requestRetry({
      url: `${BASE_URL}/`,
      method: 'POST',
      body: pubsubMessage,
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 204);

    // Wait for functions-framework process to exit
    const {stdout, stderr} = await handleLinuxFailures(proc);
    assert(stdout.includes('Hello, World!'));
  });
  // [START functions_pubsub_integration_test]
});
// [END functions_pubsub_integration_test]
