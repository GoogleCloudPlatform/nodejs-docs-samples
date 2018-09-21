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
const uuid = require('uuid');
const PubSub = require(`@google-cloud/pubsub`);
const pubsub = new PubSub();
const tools = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node risk.js';
const cwd = path.join(__dirname, `..`);

const dataset = 'integration_tests_dlp';
const uniqueField = 'Name';
const repeatedField = 'Mystery';
const numericField = 'Age';
const stringBooleanField = 'Gender';
const testProjectId = process.env.GCLOUD_PROJECT;

test.before(tools.checkCredentials);

// Create new custom topic/subscription
let topic, subscription;
const topicName = `dlp-risk-topic-${uuid.v4()}`;
const subscriptionName = `dlp-risk-subscription-${uuid.v4()}`;
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

// numericalRiskAnalysis
test(`should perform numerical risk analysis`, async t => {
  const output = await tools.runAsync(
    `${cmd} numerical ${dataset} harmful ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Value at 0% quantile: \d{2}/);
  t.regex(output, /Value at \d{2}% quantile: \d{2}/);
});

test(`should handle numerical risk analysis errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} numerical ${dataset} nonexistent ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Error in numericalRiskAnalysis/);
});

// categoricalRiskAnalysis
test(`should perform categorical risk analysis on a string field`, async t => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Most common value occurs \d time\(s\)/);
});

test(`should perform categorical risk analysis on a number field`, async t => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} harmful ${numericField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Most common value occurs \d time\(s\)/);
});

test(`should handle categorical risk analysis errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} categorical ${dataset} nonexistent ${uniqueField} ${topicName} ${subscriptionName} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Error in categoricalRiskAnalysis/);
});

// kAnonymityAnalysis
test(`should perform k-anonymity analysis on a single field`, async t => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Quasi-ID values: \{\d{2}\}/);
  t.regex(output, /Class size: \d/);
});

test(`should perform k-anonymity analysis on multiple fields`, async t => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} ${repeatedField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/);
  t.regex(output, /Class size: \d/);
});

test(`should handle k-anonymity analysis errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} kAnonymity ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Error in kAnonymityAnalysis/);
});

// kMapAnalysis
test(`should perform k-map analysis on a single field`, async t => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} -t AGE -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Anonymity range: \[\d+, \d+\]/);
  t.regex(output, /Size: \d/);
  t.regex(output, /Values: \d{2}/);
});

test(`should perform k-map analysis on multiple fields`, async t => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} harmful ${topicName} ${subscriptionName} ${numericField} ${stringBooleanField} -t AGE GENDER -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Anonymity range: \[\d+, \d+\]/);
  t.regex(output, /Size: \d/);
  t.regex(output, /Values: \d{2} Female/);
});

test(`should handle k-map analysis errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} kMap ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -t AGE -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Error in kMapEstimationAnalysis/);
});

test(`should check that numbers of quasi-ids and info types are equal`, async t => {
  const errors = await tools.runAsyncWithIO(
    `${cmd} kMap ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -t AGE GENDER -p ${testProjectId}`,
    cwd
  );
  t.regex(
    errors.stderr,
    /Number of infoTypes and number of quasi-identifiers must be equal!/
  );
});

// lDiversityAnalysis
test(`should perform l-diversity analysis on a single field`, async t => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Quasi-ID values: \{\d{2}\}/);
  t.regex(output, /Class size: \d/);
  t.regex(output, /Sensitive value James occurs \d time\(s\)/);
});

test(`should perform l-diversity analysis on multiple fields`, async t => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} harmful ${uniqueField} ${topicName} ${subscriptionName} ${numericField} ${repeatedField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Quasi-ID values: \{\d{2}, \d{4} \d{4} \d{4} \d{4}\}/);
  t.regex(output, /Class size: \d/);
  t.regex(output, /Sensitive value James occurs \d time\(s\)/);
});

test(`should handle l-diversity analysis errors`, async t => {
  const output = await tools.runAsync(
    `${cmd} lDiversity ${dataset} nonexistent ${topicName} ${subscriptionName} ${numericField} -p ${testProjectId}`,
    cwd
  );
  t.regex(output, /Error in lDiversityAnalysis/);
});
