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
const PubSub = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const uuid = require('uuid');

const cmd = 'node inspect.js';
const cwd = path.join(__dirname, `..`);
const bucket = `nodejs-docs-samples-dlp`;
const dataProject = `nodejs-docs-samples`;

test.before(tools.checkCredentials);

// Create new custom topic/subscription
let topic, subscription;
const topicName = `dlp-inspect-topic-${uuid.v4()}`;
const subscriptionName = `dlp-inspect-subscription-${uuid.v4()}`;
test.before(async () => {
  await pubsub
    .createTopic(topicName)
    .then(response => {
      topic = response[0];
      return topic.createSubscription(subscriptionName);
    })
    .then(response => {
      subscription = response[0];
    });
});

// Delete custom topic/subscription
test.after.always(async () => {
  await subscription.delete().then(() => topic.delete());
});

// inspect_string
test(`should inspect a string`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com"`,
    cwd
  );
  t.regex(output, /Info type: EMAIL_ADDRESS/);
});

test(`should handle a string with no sensitive data`, async t => {
  const output = await tools.runAsync(`${cmd} string "foo"`, cwd);
  t.is(output, 'No findings.');
});

test(`should report string inspection handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com" -t BAD_TYPE`,
    cwd
  );
  t.regex(output, /Error in inspectString/);
});

// inspect_file
test(`should inspect a local text file`, async t => {
  const output = await tools.runAsync(`${cmd} file resources/test.txt`, cwd);
  t.regex(output, /Info type: PHONE_NUMBER/);
  t.regex(output, /Info type: EMAIL_ADDRESS/);
});

test(`should inspect a local image file`, async t => {
  const output = await tools.runAsync(`${cmd} file resources/test.png`, cwd);
  t.regex(output, /Info type: EMAIL_ADDRESS/);
});

test(`should handle a local file with no sensitive data`, async t => {
  const output = await tools.runAsync(
    `${cmd} file resources/harmless.txt`,
    cwd
  );
  t.regex(output, /No findings/);
});

test(`should report local file handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} file resources/harmless.txt -t BAD_TYPE`,
    cwd
  );
  t.regex(output, /Error in inspectFile/);
});

// inspect_gcs_file_promise
test.skip(`should inspect a GCS text file`, async t => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} test.txt ${topicName} ${subscriptionName}`,
    cwd
  );
  t.regex(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
  t.regex(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
});

test.skip(`should inspect multiple GCS text files`, async t => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} "*.txt" ${topicName} ${subscriptionName}`,
    cwd
  );
  t.regex(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
  t.regex(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
});

test.skip(`should handle a GCS file with no sensitive data`, async t => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} harmless.txt ${topicName} ${subscriptionName}`,
    cwd
  );
  t.regex(output, /No findings/);
});

test(`should report GCS file handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} harmless.txt ${topicName} ${subscriptionName} -t BAD_TYPE`,
    cwd
  );
  t.regex(output, /Error in inspectGCSFile/);
});

// inspect_datastore
test.skip(`should inspect Datastore`, async t => {
  const output = await tools.runAsync(
    `${cmd} datastore Person ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`,
    cwd
  );
  t.regex(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
});

test.skip(`should handle Datastore with no sensitive data`, async t => {
  const output = await tools.runAsync(
    `${cmd} datastore Harmless ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`,
    cwd
  );
  t.regex(output, /No findings/);
});

test(`should report Datastore errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} datastore Harmless ${topicName} ${subscriptionName} --namespaceId DLP -t BAD_TYPE -p ${dataProject}`,
    cwd
  );
  t.regex(output, /Error in inspectDatastore/);
});

// inspect_bigquery
test.skip(`should inspect a Bigquery table`, async t => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmful ${topicName} ${subscriptionName} -p ${dataProject}`,
    cwd
  );
  t.regex(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
});

test.skip(`should handle a Bigquery table with no sensitive data`, async t => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmless ${topicName} ${subscriptionName} -p ${dataProject}`,
    cwd
  );
  t.regex(output, /No findings/);
});

test(`should report Bigquery table handling errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmless ${topicName} ${subscriptionName} -t BAD_TYPE -p ${dataProject}`,
    cwd
  );
  t.regex(output, /Error in inspectBigquery/);
});

// CLI options
test(`should have a minLikelihood option`, async t => {
  const promiseA = tools.runAsync(
    `${cmd} string "My phone number is (123) 456-7890." -m LIKELY`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My phone number is (123) 456-7890." -m UNLIKELY`,
    cwd
  );

  const outputA = await promiseA;
  t.truthy(outputA);
  t.notRegex(outputA, /PHONE_NUMBER/);

  const outputB = await promiseB;
  t.regex(outputB, /PHONE_NUMBER/);
});

test(`should have a maxFindings option`, async t => {
  const promiseA = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 1`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 2`,
    cwd
  );

  const outputA = await promiseA;
  t.not(outputA.includes('PHONE_NUMBER'), outputA.includes('EMAIL_ADDRESS')); // Exactly one of these should be included

  const outputB = await promiseB;
  t.regex(outputB, /PHONE_NUMBER/);
  t.regex(outputB, /EMAIL_ADDRESS/);
});

test(`should have an option to include quotes`, async t => {
  const promiseA = tools.runAsync(
    `${cmd} string "My phone number is (223) 456-7890." -q false`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My phone number is (223) 456-7890."`,
    cwd
  );

  const outputA = await promiseA;
  t.truthy(outputA);
  t.notRegex(outputA, /\(223\) 456-7890/);

  const outputB = await promiseB;
  t.regex(outputB, /\(223\) 456-7890/);
});

test(`should have an option to filter results by infoType`, async t => {
  const promiseA = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890."`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -t PHONE_NUMBER`,
    cwd
  );

  const outputA = await promiseA;
  t.regex(outputA, /EMAIL_ADDRESS/);
  t.regex(outputA, /PHONE_NUMBER/);

  const outputB = await promiseB;
  t.notRegex(outputB, /EMAIL_ADDRESS/);
  t.regex(outputB, /PHONE_NUMBER/);
});
