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
  let ffProc;
  afterEach(() => {
    if (ffProc) {
      ffProc.kill();
    }
  });
  // [START functions_pubsub_integration_test]
  it('helloPubSub: should print a name', async () => {
    const name = uuid.v4();
    const PORT = 8088; // Each running framework instance needs a unique port

    const encodedName = Buffer.from(name).toString('base64');
    const pubsubMessage = {data: {data: encodedName}};
    ffProc = spawn('npx', [
      'functions-framework',
      '--target',
      'helloPubSub',
      '--signature-type',
      'event',
      '--port',
      PORT,
    ]);
    const ffProcHandler = new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      ffProc.stdout.on('data', data => (stdout += data));
      ffProc.stderr.on('data', data => (stderr += data));
      ffProc.on('error', reject).on('exit', code => {
        code === 0 ? resolve(stdout) : reject(stderr);
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
  });
  // [END functions_pubsub_integration_test]

  let ffProc2;
  afterEach(() => {
    if (ffProc2) {
      ffProc2.kill();
    }
  });
  it('helloPubSub: should print hello world', async () => {
    const pubsubMessage = {data: {}};
    const PORT = 8089; // Each running framework instance needs a unique port
    ffProc2 = spawn('npx', [
      'functions-framework',
      '--target',
      'helloPubSub',
      '--signature-type',
      'event',
      '--port',
      PORT,
    ]);
    const ffProcHandler = new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      ffProc2.stdout.on('data', data => (stdout += data));
      ffProc2.stderr.on('data', data => (stderr += data));
      ffProc2.on('error', reject);
      ffProc2.on('exit', c => (c === 0 ? resolve(stdout) : reject(stderr)));
    });
    await waitPort({host: 'localhost', port: PORT});

    // Send HTTP request simulating Pub/Sub message
    // (GCF translates Pub/Sub messages to HTTP requests internally)
    const response = await request({
      url: `http://localhost:${PORT}/`,
      method: 'POST',
      data: pubsubMessage,
    });
    ffProc2.kill();

    assert.strictEqual(response.status, 204);

    // Wait for functions-framework process to exit
    const stdout = await ffProcHandler;
    assert.match(stdout, /Hello, World!/);
  });
  // [START functions_pubsub_integration_test]
});
// [END functions_pubsub_integration_test]
