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
const execPromise = require('child-process-promise').exec;
const path = require('path');
const uuid = require('uuid');

const requestRetry = require('requestretry');
const cwd = path.join(__dirname, '..');

// [END functions_storage_integration_test]

describe('functions_helloworld_storage integration test', () => {
  // [START functions_storage_integration_test]
  it('helloGCS: should print uploaded message', async () => {
    const filename = uuid.v4(); // Use a unique filename to avoid conflicts
    const PORT = 9000; // Each running framework instance needs a unique port

    const data = {
      data: {
        name: filename,
        resourceState: 'exists',
        metageneration: '1',
      },
    };

    // Run the functions-framework instance to host functions locally
    //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
    //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    const proc = execPromise(
      `functions-framework --target=helloGCS --signature-type=event --port=${PORT} & sleep 1; kill $!`,
      {shell: true, cwd}
    );

    // Send HTTP request simulating GCS change notification
    // (GCF translates GCS notifications to HTTP requests internally)
    const response = await requestRetry({
      url: `http://localhost:${PORT}/`,
      method: 'POST',
      body: data,
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 204);

    // Wait for functions-framework process to exit
    const {stdout} = await proc;
    assert.ok(stdout.includes(`File ${filename} uploaded.`));
  });
  // [END functions_storage_integration_test]

  it('helloGCS: should print metadata updated message', async () => {
    const filename = uuid.v4(); // Use a unique filename to avoid conflicts
    const PORT = 9001; // Each running framework instance needs a unique port

    const data = {
      data: {
        name: filename,
        resourceState: 'exists',
        metageneration: '2',
      },
    };

    // Run the functions-framework instance to host functions locally
    //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
    //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    const proc = execPromise(
      `functions-framework --target=helloGCS --signature-type=event --port=${PORT} & sleep 1; kill $!`,
      {shell: true, cwd}
    );

    // Send HTTP request simulating GCS change notification
    // (GCF translates GCS notifications to HTTP requests internally)
    const response = await requestRetry({
      url: `http://localhost:${PORT}/`,
      method: 'POST',
      body: data,
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 204);

    // Wait for functions-framework process to exit
    const {stdout} = await proc;
    assert.ok(stdout.includes(`File ${filename} metadata updated.`));
  });

  it('helloGCS: should print deleted message', async () => {
    const filename = uuid.v4(); // Use a unique filename to avoid conflicts
    const PORT = 9002; // Each running framework instance needs a unique port

    const data = {
      data: {
        name: filename,
        resourceState: 'not_exists',
        metageneration: '3',
      },
    };

    // Run the functions-framework instance to host functions locally
    //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
    //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    const proc = execPromise(
      `functions-framework --target=helloGCS --signature-type=event --port=${PORT} & sleep 1; kill $!`,
      {shell: true, cwd}
    );

    // Send HTTP request simulating GCS change notification
    // (GCF translates GCS notifications to HTTP requests internally)
    const response = await requestRetry({
      url: `http://localhost:${PORT}/`,
      method: 'POST',
      body: data,
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 204);

    // Wait for functions-framework process to exit
    const {stdout} = await proc;
    assert.ok(stdout.includes(`File ${filename} deleted.`));
  });
  // [START functions_storage_integration_test]
});
// [END functions_storage_integration_test]
