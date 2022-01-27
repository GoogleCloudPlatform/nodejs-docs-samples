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

// [START functions_storage_integration_test]
const assert = require('assert');
const {spawn} = require('child_process');
const uuid = require('uuid');
const {request} = require('gaxios');
const waitPort = require('wait-port');

// [END functions_storage_integration_test]

describe('functions_helloworld_storage integration test', () => {
  // [START functions_storage_integration_test]
  it('helloGCSGeneric: should print GCS event', async () => {
    const filename = uuid.v4(); // Use a unique filename to avoid conflicts
    const PORT = 9009; // Each running framework instance needs a unique port

    const eventType = 'google.storage.object.finalize';

    const data = {
      data: {
        name: filename,
        resourceState: 'exists',
        metageneration: '1',
      },
      context: {
        eventType: eventType,
      },
    };
    const ffProc = spawn('npx', [
      'functions-framework',
      '--target',
      'helloGCS',
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

    // Send HTTP request simulating GCS change notification
    // (GCF translates GCS notifications to HTTP requests internally)
    const response = await request({
      url: `http://localhost:${PORT}/`,
      method: 'POST',
      data,
    });
    assert.strictEqual(response.status, 204);

    ffProc.kill();
    const stdout = await ffProcHandler;
    assert.ok(stdout.includes(`File: ${filename}`));
    assert.ok(stdout.includes(`Event Type: ${eventType}`));
  });
});
// [END functions_storage_integration_test]
