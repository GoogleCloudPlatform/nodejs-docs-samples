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

const cmd = 'node inspect';
const cwd = path.join(__dirname, `..`);

test.before(tools.checkCredentials);

// inspect_string
test(`should inspect a string`, async (t) => {
  const output = await tools.runAsync(`${cmd} string "I'm Gary and my email is gary@example.com"`, cwd);
  t.regex(output, /"name": "EMAIL_ADDRESS"/);
});

test(`should handle a string with no sensitive data`, async (t) => {
  const output = await tools.runAsync(`${cmd} string "foo"`, cwd);
  t.is(output, 'undefined');
});

test(`should report string inspection handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} string "I'm Gary and my email is gary@example.com" -a foo`, cwd);
  t.regex(output, /Error in inspectString/);
});

// inspect_file
test(`should inspect a local text file`, async (t) => {
  const output = await tools.runAsync(`${cmd} file resources/test.txt`, cwd);
  t.regex(output, /"name": "PHONE_NUMBER"/);
  t.regex(output, /"name": "EMAIL_ADDRESS"/);
});

test(`should inspect a local image file`, async (t) => {
  const output = await tools.runAsync(`${cmd} file resources/test.png`, cwd);
  t.regex(output, /"name": "PHONE_NUMBER"/);
});

test(`should handle a local file with no sensitive data`, async (t) => {
  const output = await tools.runAsync(`${cmd} file resources/harmless.txt`, cwd);
  t.is(output, 'undefined');
});

test(`should report local file handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} file resources/harmless.txt -a foo`, cwd);
  t.regex(output, /Error in inspectFile/);
});

// inspect_gcs_file
test.serial(`should inspect a GCS text file`, async (t) => {
  const output = await tools.runAsync(`${cmd} gcsFile nodejs-docs-samples-dlp test.txt`, cwd);
  t.regex(output, /"name": "PHONE_NUMBER"/);
  t.regex(output, /"name": "EMAIL_ADDRESS"/);
});

test.serial(`should inspect multiple GCS text files`, async (t) => {
  const output = await tools.runAsync(`${cmd} gcsFile nodejs-docs-samples-dlp *.txt`, cwd);
  t.regex(output, /"name": "PHONE_NUMBER"/);
  t.regex(output, /"name": "EMAIL_ADDRESS"/);
  t.regex(output, /"name": "CREDIT_CARD_NUMBER"/);
});

test.serial(`should accept try limits for inspecting GCS files`, async (t) => {
  const output = await tools.runAsync(`${cmd} gcsFile nodejs-docs-samples-dlp test.txt --tries 0`, cwd);
  t.regex(output, /polling timed out/);
});

test.serial(`should handle a GCS file with no sensitive data`, async (t) => {
  const output = await tools.runAsync(`${cmd} gcsFile nodejs-docs-samples-dlp harmless.txt`, cwd);
  t.is(output, 'undefined');
});

test.serial(`should report GCS file handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} gcsFile nodejs-docs-samples-dlp harmless.txt -a foo`, cwd);
  t.regex(output, /Error in inspectGCSFile/);
});

// inspect_datastore
test.serial(`should inspect Datastore`, async (t) => {
  const output = await tools.runAsync(`${cmd} datastore Person --namespaceId DLP`, cwd);
  t.regex(output, /"name": "PHONE_NUMBER"/);
  t.regex(output, /"name": "EMAIL_ADDRESS"/);
});

test.serial(`should accept try limits for inspecting Datastore`, async (t) => {
  const output = await tools.runAsync(`${cmd} datastore Person --namespaceId DLP --tries 0`, cwd);
  t.regex(output, /polling timed out/);
});

test.serial(`should handle Datastore with no sensitive data`, async (t) => {
  const output = await tools.runAsync(`${cmd} datastore Harmless --namespaceId DLP`, cwd);
  t.is(output, 'undefined');
});

test.serial(`should report Datastore file handling errors`, async (t) => {
  const output = await tools.runAsync(`${cmd} datastore Harmless --namespaceId DLP -a foo`, cwd);
  t.regex(output, /Error in inspectDatastore/);
});

// CLI options
test(`should have a minLikelihood option`, async (t) => {
  const promiseA = tools.runAsync(`${cmd} string "My phone number is (123) 456-7890." -m POSSIBLE`, cwd);
  const promiseB = tools.runAsync(`${cmd} string "My phone number is (123) 456-7890." -m UNLIKELY`, cwd);

  const outputA = await promiseA;
  t.truthy(outputA);
  t.notRegex(outputA, /PHONE_NUMBER/);

  const outputB = await promiseB;
  t.regex(outputB, /PHONE_NUMBER/);
});

test(`should have a maxFindings option`, async (t) => {
  const promiseA = tools.runAsync(`${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 1`, cwd);
  const promiseB = tools.runAsync(`${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 2`, cwd);

  const outputA = await promiseA;
  t.not(outputA.includes('PHONE_NUMBER'), outputA.includes('EMAIL_ADDRESS')); // Exactly one of these should be included

  const outputB = await promiseB;
  t.regex(outputB, /PHONE_NUMBER/);
  t.regex(outputB, /EMAIL_ADDRESS/);
});

test(`should have an option to include quotes`, async (t) => {
  const promiseA = tools.runAsync(`${cmd} string "My phone number is (223) 456-7890." -q false`, cwd);
  const promiseB = tools.runAsync(`${cmd} string "My phone number is (223) 456-7890."`, cwd);

  const outputA = await promiseA;
  t.truthy(outputA);
  t.notRegex(outputA, /\(223\) 456-7890/);

  const outputB = await promiseB;
  t.regex(outputB, /\(223\) 456-7890/);
});

test(`should have an option to filter results by infoType`, async (t) => {
  const promiseA = tools.runAsync(`${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890."`, cwd);
  const promiseB = tools.runAsync(`${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -t PHONE_NUMBER`, cwd);

  const outputA = await promiseA;
  t.regex(outputA, /EMAIL_ADDRESS/);
  t.regex(outputA, /PHONE_NUMBER/);

  const outputB = await promiseB;
  t.notRegex(outputB, /EMAIL_ADDRESS/);
  t.regex(outputB, /PHONE_NUMBER/);
});

test(`should have an option for custom auth tokens`, async (t) => {
  const output = await tools.runAsync(`${cmd} string "My name is Gary and my phone number is (223) 456-7890." -a foo`, cwd);
  t.regex(output, /Error in inspectString/);
  t.regex(output, /invalid authentication/);
});
