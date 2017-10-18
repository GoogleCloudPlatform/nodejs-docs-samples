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

const cmd = 'node risk';
const cwd = path.join(__dirname, `..`);

const dataset = 'integration_tests_dlp';
const uniqueField = 'Name';
const repeatedField = 'Mystery';
const numericField = 'Age';

test.before(tools.checkCredentials);

// numericalRiskAnalysis
test(`should perform numerical risk analysis`, async (t) => {
  const output = await tools.runAsync(`${cmd} numerical ${dataset} harmful ${numericField}`, cwd);
  t.regex(output, /Value at 0% quantile: \d{2}/);
  t.regex(output, /Value at \d{2}% quantile: \d{2}/);
});

test(`should handle numerical risk analysis errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} numerical ${dataset} nonexistent ${numericField}`, cwd);
  t.regex(output, /Error in numericalRiskAnalysis/);
});

// categoricalRiskAnalysis
test(`should perform categorical risk analysis on a string field`, async (t) => {
  const output = await tools.runAsync(`${cmd} categorical ${dataset} harmful ${uniqueField}`, cwd);
  t.regex(output, /Most common value occurs \d time\(s\)/);
});

test(`should perform categorical risk analysis on a number field`, async (t) => {
  const output = await tools.runAsync(`${cmd} categorical ${dataset} harmful ${numericField}`, cwd);
  t.regex(output, /Most common value occurs \d time\(s\)/);
});

test(`should handle categorical risk analysis errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} categorical ${dataset} nonexistent ${uniqueField}`, cwd);
  t.regex(output, /Error in categoricalRiskAnalysis/);
});

// kAnonymityAnalysis
test(`should perform k-anonymity analysis on a single field`, async (t) => {
  const output = await tools.runAsync(`${cmd} kAnonymity ${dataset} harmful ${numericField}`, cwd);
  t.regex(output, /Quasi-ID values: \{\d{2}\}/);
  t.regex(output, /Class size: \d/);
});

test(`should perform k-anonymity analysis on multiple fields`, async (t) => {
  const output = await tools.runAsync(`${cmd} kAnonymity ${dataset} harmful ${numericField} ${repeatedField}`, cwd);
  t.regex(output, /Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/);
  t.regex(output, /Class size: \d/);
});

test(`should handle k-anonymity analysis errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} kAnonymity ${dataset} nonexistent ${numericField}`, cwd);
  t.regex(output, /Error in kAnonymityAnalysis/);
});

// lDiversityAnalysis
test(`should perform l-diversity analysis on a single field`, async (t) => {
  const output = await tools.runAsync(`${cmd} lDiversity ${dataset} harmful ${uniqueField} ${numericField}`, cwd);
  t.regex(output, /Quasi-ID values: \{\d{2}\}/);
  t.regex(output, /Class size: \d/);
  t.regex(output, /Sensitive value James occurs \d time\(s\)/);
});

test(`should perform l-diversity analysis on multiple fields`, async (t) => {
  const output = await tools.runAsync(`${cmd} lDiversity ${dataset} harmful ${uniqueField} ${numericField} ${repeatedField}`, cwd);
  t.regex(output, /Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/);
  t.regex(output, /Class size: \d/);
  t.regex(output, /Sensitive value James occurs \d time\(s\)/);
});

test(`should handle l-diversity analysis errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} lDiversity ${dataset} nonexistent ${uniqueField} ${numericField}`, cwd);
  t.regex(output, /Error in lDiversityAnalysis/);
});
