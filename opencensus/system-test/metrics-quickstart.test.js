// Copyright 2019 Google LLC
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

'use strict';

const childProcess = require('child_process');
const assert = require('assert');

it('Should throw an error without projectId', async () => {
  process.env.GOOGLE_PROJECT_ID = '';

  try {
    await childProcess.execSync('node metrics-quickstart.js');
    assert.fail('Did not throw an error.');
  } catch (err) {
    assert.ok(err.message.includes('Unable to proceed without a Project ID'));
  }
});

it('Should capture stats data and export it to backend', async () => {
  process.env.GOOGLE_PROJECT_ID = 'fake-id';
  process.env.KUBERNETES_SERVICE_HOST = 'localhost';
  process.env.EXPORT_INTERVAL = 1;

  const output = await childProcess.execSync('node metrics-quickstart.js');
  assert.ok(new RegExp('Latency *:*').test(output));
  assert.ok(output.includes('Done recording metrics.'));
});
