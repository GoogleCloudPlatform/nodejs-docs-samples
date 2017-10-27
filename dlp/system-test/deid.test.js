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
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node deid';
const cwd = path.join(__dirname, `..`);

const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';

const wrappedKey = process.env.DLP_DEID_WRAPPED_KEY;
const keyName = process.env.DLP_DEID_KEY_NAME;

test.before(tools.checkCredentials);

// deidentify_masking
test(`should mask sensitive data in a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} mask "${harmfulString}" -c x -n 5`,
    cwd
  );
  t.is(output, 'My SSN is xxxxx9127');
});

test(`should ignore insensitive data when masking a string`, async t => {
  const output = await tools.runAsync(`${cmd} mask "${harmlessString}"`, cwd);
  t.is(output, harmlessString);
});

test(`should handle masking errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} mask "${harmfulString}" -n -1`,
    cwd
  );
  t.regex(output, /Error in deidentifyWithMask/);
});

// deidentify_fpe
test(`should FPE encrypt sensitive data in a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} fpe "${harmfulString}" ${wrappedKey} ${keyName} -a NUMERIC`,
    cwd
  );
  t.regex(output, /My SSN is \d{9}/);
  t.not(output, harmfulString);
});

test(`should ignore insensitive data when FPE encrypting a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} fpe "${harmlessString}" ${wrappedKey} ${keyName}`,
    cwd
  );
  t.is(output, harmlessString);
});

test(`should handle FPE encryption errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} fpe "${harmfulString}" ${wrappedKey} BAD_KEY_NAME`,
    cwd
  );
  t.regex(output, /Error in deidentifyWithFpe/);
});
