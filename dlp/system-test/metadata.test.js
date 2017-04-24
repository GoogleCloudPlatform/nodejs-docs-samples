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

const cmd = 'node metadata';
const cwd = path.join(__dirname, `..`);

test.before(tools.checkCredentials);

test(`should list info types for a given category`, async (t) => {
  const output = await tools.runAsync(`${cmd} infoTypes GOVERNMENT`, cwd);
  t.regex(output, /name: 'US_DRIVERS_LICENSE_NUMBER'/);
});

test(`should inspect categories`, async (t) => {
  const output = await tools.runAsync(`${cmd} categories`, cwd);
  t.regex(output, /name: 'FINANCE'/);
});

test(`should have an option for custom auth tokens`, async (t) => {
  const output = await tools.runAsync(`${cmd} categories -a foo`, cwd);
  t.regex(output, /Error in listCategories/);
  t.regex(output, /invalid authentication/);
});

// Error handling
test(`should report info type listing handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} infoTypes GOVERNMENT -a foo`, cwd);
  t.regex(output, /Error in listInfoTypes/);
});

test(`should report category listing handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} categories -a foo`, cwd);
  t.regex(output, /Error in listCategories/);
});
