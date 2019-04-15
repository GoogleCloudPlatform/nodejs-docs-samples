/**
 * Copyright 2019, Google, LLC.
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

'use strict';

const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

it('Should throw an error without projectId', done => {
  process.env.GOOGLE_PROJECT_ID = '';
  const error = new Error(`Unable to proceed without a Project ID`);
  tools.runAsync('node metrics-quickstart.js').then(
    () => {},
    err => {
      assert.ok(err.message.includes(error.message));
      done();
    }
  );
});

it('Should capture stats data and export it to backend', async () => {
  process.env.GOOGLE_PROJECT_ID = 'fake-id';
  process.env.KUBERNETES_SERVICE_HOST = 'localhost';
  const output = await tools.runAsync('node metrics-quickstart.js');
  assert.ok(new RegExp('Latency *:*').test(output));
  assert.ok(new RegExp('Done recording metrics.').test(output));
});
