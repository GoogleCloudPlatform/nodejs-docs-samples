/**
 * Copyright 2018, Google, Inc.
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
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const uuid = require('uuid');

const cmd = 'node inspect.js';
const cwd = path.join(__dirname, '..');
const bucket = 'nodejs-docs-samples-dlp';
const dataProject = 'nodejs-docs-samples';

// Create new custom topic/subscription
let topic, subscription;
const topicName = `dlp-inspect-topic-${uuid.v4()}`;
const subscriptionName = `dlp-inspect-subscription-${uuid.v4()}`;
before(async () => {
  tools.checkCredentials();
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
after(async () => await subscription.delete().then(() => topic.delete()));

// inspect_string
it('should inspect a string', async () => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com"`,
    cwd
  );
  assert.strictEqual(new RegExp(/Info type: EMAIL_ADDRESS/).test(output), true);
});

it('should inspect a string with custom dictionary', async () => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com" -d "Gary,email"`,
    cwd
  );
  assert.strictEqual(new RegExp(/Info type: CUSTOM_DICT_0/).test(output), true);
});

it('should inspect a string with custom regex', async () => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com" -r "gary@example\\.com"`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Info type: CUSTOM_REGEX_0/).test(output),
    true
  );
});

it('should handle a string with no sensitive data', async () => {
  const output = await tools.runAsync(`${cmd} string "foo"`, cwd);
  assert.strictEqual(output, 'No findings.');
});

it('should report string inspection handling errors', async () => {
  const output = await tools.runAsync(
    `${cmd} string "I'm Gary and my email is gary@example.com" -t BAD_TYPE`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in inspectString/).test(output), true);
});

// inspect_file
it('should inspect a local text file', async () => {
  const output = await tools.runAsync(`${cmd} file resources/test.txt`, cwd);
  assert.strictEqual(new RegExp(/Info type: PHONE_NUMBER/).test(output), true);
  assert.strictEqual(new RegExp(/Info type: EMAIL_ADDRESS/).test(output), true);
});

it('should inspect a local text file with custom dictionary', async () => {
  const output = await tools.runAsync(
    `${cmd} file resources/test.txt -d "gary@somedomain.com"`,
    cwd
  );
  assert.strictEqual(new RegExp(/Info type: CUSTOM_DICT_0/).test(output), true);
});

it('should inspect a local text file with custom regex', async () => {
  const output = await tools.runAsync(
    `${cmd} file resources/test.txt -r "\\(\\d{3}\\) \\d{3}-\\d{4}"`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Info type: CUSTOM_REGEX_0/).test(output),
    true
  );
});

it('should inspect a local image file', async () => {
  const output = await tools.runAsync(`${cmd} file resources/test.png`, cwd);
  assert.strictEqual(new RegExp(/Info type: EMAIL_ADDRESS/).test(output), true);
});

it('should handle a local file with no sensitive data', async () => {
  const output = await tools.runAsync(
    `${cmd} file resources/harmless.txt`,
    cwd
  );
  assert.strictEqual(new RegExp(/No findings/).test(output), true);
});

it('should report local file handling errors', async () => {
  const output = await tools.runAsync(
    `${cmd} file resources/harmless.txt -t BAD_TYPE`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in inspectFile/).test(output), true);
});

// inspect_gcs_file_promise
it.skip('should inspect a GCS text file', async () => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} test.txt ${topicName} ${subscriptionName}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType PHONE_NUMBER/).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType EMAIL_ADDRESS/).test(output),
    true
  );
});

it.skip('should inspect multiple GCS text files', async () => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} "*.txt" ${topicName} ${subscriptionName}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType PHONE_NUMBER/).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType EMAIL_ADDRESS/).test(output),
    true
  );
});

it.skip('should handle a GCS file with no sensitive data', async () => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} harmless.txt ${topicName} ${subscriptionName}`,
    cwd
  );
  assert.strictEqual(new RegExp(/No findings/).test(output), true);
});

it('should report GCS file handling errors', async () => {
  const output = await tools.runAsync(
    `${cmd} gcsFile ${bucket} harmless.txt ${topicName} ${subscriptionName} -t BAD_TYPE`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in inspectGCSFile/).test(output), true);
});

// inspect_datastore
it.skip('should inspect Datastore', async () => {
  const output = await tools.runAsync(
    `${cmd} datastore Person ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType EMAIL_ADDRESS/).test(output),
    true
  );
});

it.skip('should handle Datastore with no sensitive data', async () => {
  const output = await tools.runAsync(
    `${cmd} datastore Harmless ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(new RegExp(/No findings/).test(output), true);
});

it('should report Datastore errors', async () => {
  const output = await tools.runAsync(
    `${cmd} datastore Harmless ${topicName} ${subscriptionName} --namespaceId DLP -t BAD_TYPE -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in inspectDatastore/).test(output),
    true
  );
});

// inspect_bigquery
it.skip('should inspect a Bigquery table', async () => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmful ${topicName} ${subscriptionName} -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Found \d instance\(s\) of infoType PHONE_NUMBER/).test(output),
    true
  );
});

it.skip('should handle a Bigquery table with no sensitive data', async () => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmless ${topicName} ${subscriptionName} -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(new RegExp(/No findings/).test(output), true);
});

it('should report Bigquery table handling errors', async () => {
  const output = await tools.runAsync(
    `${cmd} bigquery integration_tests_dlp harmless ${topicName} ${subscriptionName} -t BAD_TYPE -p ${dataProject}`,
    cwd
  );
  assert.strictEqual(new RegExp(/Error in inspectBigquery/).test(output), true);
});

// CLI options
it('should have a minLikelihood option', async () => {
  const promiseA = tools.runAsync(
    `${cmd} string "My phone number is (123) 456-7890." -m VERY_LIKELY`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My phone number is (123) 456-7890." -m UNLIKELY`,
    cwd
  );

  const outputA = await promiseA;
  assert.ok(outputA);
  assert.strictEqual(new RegExp(/PHONE_NUMBER/).test(outputA), false);

  const outputB = await promiseB;
  assert.strictEqual(new RegExp(/PHONE_NUMBER/).test(outputB), true);
});

it('should have a maxFindings option', async () => {
  const promiseA = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 1`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -f 2`,
    cwd
  );

  const outputA = await promiseA;
  assert.notStrictEqual(
    outputA.includes('PHONE_NUMBER'),
    outputA.includes('EMAIL_ADDRESS')
  ); // Exactly one of these should be included

  const outputB = await promiseB;
  assert.strictEqual(new RegExp(/PHONE_NUMBER/).test(outputB), true);
  assert.strictEqual(new RegExp(/EMAIL_ADDRESS/).test(outputB), true);
});

it('should have an option to include quotes', async () => {
  const promiseA = tools.runAsync(
    `${cmd} string "My phone number is (223) 456-7890." -q false`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My phone number is (223) 456-7890."`,
    cwd
  );

  const outputA = await promiseA;
  assert.ok(outputA);
  assert.strictEqual(new RegExp(/\(223\) 456-7890/).test(outputA), false);

  const outputB = await promiseB;
  assert.strictEqual(new RegExp(/\(223\) 456-7890/).test(outputB), true);
});

it('should have an option to filter results by infoType', async () => {
  const promiseA = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890."`,
    cwd
  );
  const promiseB = tools.runAsync(
    `${cmd} string "My email is gary@example.com and my phone number is (223) 456-7890." -t PHONE_NUMBER`,
    cwd
  );

  const outputA = await promiseA;
  assert.strictEqual(new RegExp(/EMAIL_ADDRESS/).test(outputA), true);
  assert.strictEqual(new RegExp(/PHONE_NUMBER/).test(outputA), true);

  const outputB = await promiseB;
  assert.strictEqual(new RegExp(/EMAIL_ADDRESS/).test(outputB), false);
  assert.strictEqual(new RegExp(/PHONE_NUMBER/).test(outputB), true);
});
