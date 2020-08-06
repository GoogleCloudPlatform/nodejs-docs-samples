// Copyright 2017 Google LLC
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

const path = require('path');
const assert = require('assert');
const {execSync} = require('child_process');

const cwd = path.join(__dirname, '..');
const cmd = 'node auth.js';

const {BUCKET_NAME} = process.env;

before(() => {
  assert(
    process.env.GOOGLE_CLOUD_PROJECT,
    `Must set GOOGLE_CLOUD_PROJECT environment variable!`
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    `Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!`
  );
});

it('should load credentials implicitly', () => {
  const output = execSync(`${cmd} auth-cloud-implicit`, {cwd, shell: true});
  assert.strictEqual(output.includes(BUCKET_NAME), true);
});

it('should load credentials explicitly', () => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const keyfile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log(`${cmd} auth-cloud-explicit -p ${project} -k ${keyfile}`);
  const output = execSync(
    `${cmd} auth-cloud-explicit -p ${project} -k ${keyfile}`,
    {cwd, shell: true}
  );
  assert.strictEqual(output.includes(BUCKET_NAME), true);
});
