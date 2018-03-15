/**
 * Copyright 2017, Google, Inc.
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

const path = require('path');
const test = require('ava');
const fs = require('fs');
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node redact.js';
const cwd = path.join(__dirname, `..`);

const testImage = 'resources/test.png';
const testResourcePath = 'system-test/resources';

test.before(tools.checkCredentials);

// redact_image
test(`should redact a single sensitive data type from an image`, async t => {
  const testName = `redact-single-type`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.result.png -t PHONE_NUMBER`,
    cwd
  );

  t.regex(output, /Saved image redaction results to path/);

  const correct = fs.readFileSync(
    `${testResourcePath}/${testName}.correct.png`
  );
  const result = fs.readFileSync(`${testName}.result.png`);
  t.deepEqual(correct, result);
});

test(`should redact multiple sensitive data types from an image`, async t => {
  const testName = `redact-multiple-types`;
  const output = await tools.runAsync(
    `${cmd} image ${testImage} ${testName}.result.png -t PHONE_NUMBER EMAIL_ADDRESS`,
    cwd
  );

  t.regex(output, /Saved image redaction results to path/);

  const correct = fs.readFileSync(
    `${testResourcePath}/${testName}.correct.png`
  );
  const result = fs.readFileSync(`${testName}.result.png`);
  t.deepEqual(correct, result);
});

test(`should report image redaction handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} image ${testImage} nonexistent.result.png -t BAD_TYPE`,
    cwd
  );
  t.regex(output, /Error in redactImage/);
});
