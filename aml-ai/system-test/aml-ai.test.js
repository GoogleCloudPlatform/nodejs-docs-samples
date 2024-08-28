/**
 * Copyright 2024 Google LLC
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
const path = require('path');
const cwd = path.join(__dirname, '..');
const {execSync} = require('child_process');
const {it} = require('mocha');

const projectId = process.env.GCLOUD_PROJECT;
const cloudRegion = 'us-central1';

it('should get the AML AI API locations', () => {
  const output = execSync(`node listLocations.js ${projectId}`, {cwd});
  assert.ok(output.includes(cloudRegion));
});
