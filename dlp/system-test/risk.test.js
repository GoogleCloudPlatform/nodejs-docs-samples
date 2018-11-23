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
const uuid = require('uuid');
const {PubSub} = require(`@google-cloud/pubsub`);
const pubsub = new PubSub();
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node risk.js';
const cwd = path.join(__dirname, '..');

const dataset = 'integration_tests_dlp';
const uniqueField = 'Name';
const repeatedField = 'Mystery';
const numericField = 'Age';
const stringBooleanField = 'Gender';
const testProjectId = process.env.GCLOUD_PROJECT;

// Create new custom topic/subscription
let topic, subscription;
const topicName = `dlp-risk-topic-${uuid.v4()}`;
const subscriptionName = `dlp-risk-subscription-${uuid.v4()}`;
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

// numericalRiskAnalysis
it('should perform numerical risk analysis', async () => {
  const output = await tools.runAsync(
    `${cmd} numerical ${dataset} harmful ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Value at 0% quantile: \d{2}/).test(output),
    true
  );
  assert.strictEqual(
    new RegExp(/Value at \d{2}% quantile: \d{2}/).test(output),
    true
  );
});

it('should handle numerical risk analysis errors', async () => {
  const output = await tools.runAsync(
    `${cmd} numerical ${dataset} nonexistent ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in numericalRiskAnalysis/).test(output),
    true
  );
});

// categoricalRiskAnalysis
it('should perform categorical risk analysis on a string field', async () => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Most common value occurs \d time\(s\)/).test(output),
    true
  );
});

it('should perform categorical risk analysis on a number field', async () => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} harmful ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Most common value occurs \d time\(s\)/).test(output),
    true
  );
});

it('should handle categorical risk analysis errors', async () => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} nonexistent ${uniqueField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in categoricalRiskAnalysis/).test(output),
    true
  );
});

// kAnonymityAnalysis
it('should perform k-anonymity analysis on a single field', async () => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Quasi-ID values: \{\d{2}\}/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Class size: \d/).test(output), true);
});

it('should perform k-anonymity analysis on multiple fields', async () => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} ${repeatedField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/).test(
      output
    ),
    true
  );
  assert.strictEqual(new RegExp(/Class size: \d/).test(output), true);
});

it('should handle k-anonymity analysis errors', async () => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in kAnonymityAnalysis/).test(output),
    true
  );
});

// kMapAnalysis
it('should perform k-map analysis on a single field', async () => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} -t AGE -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Anonymity range: \[\d+, \d+\]/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Size: \d/).test(output), true);
  assert.strictEqual(new RegExp(/Values: \d{2}/).test(output), true);
});

it('should perform k-map analysis on multiple fields', async () => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} ${stringBooleanField} -t AGE GENDER -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Anonymity range: \[\d+, \d+\]/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Size: \d/).test(output), true);
  assert.strictEqual(new RegExp(/Values: \d{2} Female/).test(output), true);
});

it('should handle k-map analysis errors', async () => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -t AGE -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in kMapEstimationAnalysis/).test(output),
    true
  );
});

it('should check that numbers of quasi-ids and info types are equal', async () => {
  const errors = await tools.runAsyncWithIO(
    `${cmd} kMap ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -t AGE GENDER -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(
      /Number of infoTypes and number of quasi-identifiers must be equal!/
    ).test(errors.stderr),
    true
  );
});

// lDiversityAnalysis
it('should perform l-diversity analysis on a single field', async () => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Quasi-ID values: \{\d{2}\}/).test(output),
    true
  );
  assert.strictEqual(new RegExp(/Class size: \d/).test(output), true);
  assert.strictEqual(
    new RegExp(/Sensitive value James occurs \d time\(s\)/).test(output),
    true
  );
});

it('should perform l-diversity analysis on multiple fields', async () => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} ${numericField} ${repeatedField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/).test(
      output
    ),
    true
  );
  assert.strictEqual(new RegExp(/Class size: \d/).test(output), true);
  assert.strictEqual(
    new RegExp(/Sensitive value James occurs \d time\(s\)/).test(output),
    true
  );
});

it('should handle l-diversity analysis errors', async () => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  assert.strictEqual(
    new RegExp(/Error in lDiversityAnalysis/).test(output),
    true
  );
});
