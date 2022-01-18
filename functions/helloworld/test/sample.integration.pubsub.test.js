// Copyright 2018 Google LLC
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

// [START functions_pubsub_integration_test]
const assert = require('assert');
const {spawn} = require('child_process');
const {request} = require('gaxios');
const uuid = require('uuid');
const waitPort = require('wait-port');

// [END functions_pubsub_integration_test]

describe('functions_helloworld_pubsub integration test', () => {
  // [START functions_pubsub_integration_test]
  it('helloPubSub: should print a name', async () => {
    const name = uuid.v4();
    const PORT = 8088; // Each running framework instance needs a unique port

    const encodedName = Buffer.from(name).toString('base64');
    const pubsubMessage = {data: {data: encodedName}};
    const ffProc = spawn('npx', [
      'functions-framework',
      '--target',
      'helloPubSub',
      '--signature-type',
      'event',
      '--port',
      PORT,
    ]);

    try {
      const ffProcHandler = new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        ffProc.stdout.on('data', data => (stdout += data));
        ffProc.stderr.on('data', data => (stderr += data));
        ffProc.on('exit', code => {
          if (code === 0 || code === null) {
            // code === null corresponds to a signal-kill
            // (which doesn't necessarily indicate a test failure)
            resolve(stdout);
          } else {
            stderr = `Error code: ${code}\n${stderr}`;
            reject(new Error(stderr));
          }
        });
      });
      await waitPort({host: 'localhost', port: PORT});

      // Send HTTP request simulating Pub/Sub message
      // (GCF translates Pub/Sub messages to HTTP requests internally)
      const response = await request({
        url: `http://localhost:${PORT}/`,
        method: 'POST',
        data: pubsubMessage,
      });
      ffProc.kill();

      assert.strictEqual(response.status, 204);

      // Wait for the functions framework to stop
      const stdout = await ffProcHandler;
      assert.match(stdout, new RegExp(`Hello, ${name}!`));
    } catch {
      if (ffProc) {
        // Make sure the functions framework is stopped
        ffProc.kill();
      }
    }
  });
  // [END functions_pubsub_integration_test]

  it('helloPubSub: should print hello world', async () => {
    const pubsubMessage = {data: {}};
    const PORT = 8089; // Each running framework instance needs a unique port
    const ffProc = spawn('npx', [
      'functions-framework',
      '--target',
      'helloPubSub',
      '--signature-type',
      'event',
      '--port',
      PORT,
    ]);

    try {
      const ffProcHandler = new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        ffProc.stdout.on('data', data => (stdout += data));
        ffProc.stderr.on('data', data => (stderr += data));
        ffProc.on('error', reject);
        ffProc.on('exit', code => {
          if (code === 0 || code === null) {
            // code === null corresponds to a signal-kill
            // (which doesn't necessarily indicate a test failure)
            resolve(stdout);
          } else {
            stderr = `Error code: ${code}\n${stderr}`;
            reject(new Error(stderr));
          }
        });
      });
      await waitPort({host: 'localhost', port: PORT});

      // Send HTTP request simulating Pub/Sub message
      // (GCF translates Pub/Sub messages to HTTP requests internally)
      const response = await request({
        url: `http://localhost:${PORT}/`,
        method: 'POST',
        data: pubsubMessage,
      });
      ffProc.kill();

      assert.strictEqual(response.status, 204);

      // Wait for functions-framework process to exit
      const stdout = await ffProcHandler;
      assert.match(stdout, /Hello, World!/);
    } catch {
      if (ffProc) {
        // Make sure the functions framework is stopped
        ffProc.kill();
      }
    }
  });
  // [START functions_pubsub_integration_test]
});
// [END functions_pubsub_integration_test]
