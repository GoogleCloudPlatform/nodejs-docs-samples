// Copyright 2018 Google LLC
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

const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const uuid = require('uuid');
const DLP = require('@google-cloud/dlp');

const bucket = 'nodejs-docs-samples-dlp';
const dataProject = 'nodejs-docs-samples';

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new DLP.DlpServiceClient();
describe('inspect', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  let topic, subscription;
  const topicName = `dlp-inspect-topic-${uuid.v4()}`;
  const subscriptionName = `dlp-inspect-subscription-${uuid.v4()}`;
  before(async () => {
    [topic] = await pubsub.createTopic(topicName);
    [subscription] = await topic.createSubscription(subscriptionName);
  });

  // Delete custom topic/subscription
  after(async () => {
    await subscription.delete();
    await topic.delete();
  });

  // inspect_string
  it('should inspect a string', () => {
    const output = execSync(
      `node inspectString.js ${projectId} "I'm Gary and my email is gary@example.com"`
    );
    assert.match(output, /Info type: EMAIL_ADDRESS/);
  });

  it('should inspect a string with custom dictionary', () => {
    const output = execSync(
      `node inspectString.js ${projectId} "I'm Gary and my email is gary@example.com" 'LIKELIHOOD_UNSPECIFIED' '0' 'PHONE_NUMBER' "Gary,email"`
    );
    assert.match(output, /Info type: CUSTOM_DICT_0/);
  });

  it('should inspect a string with custom regex', () => {
    const output = execSync(
      `node inspectString.js ${projectId} "I'm Gary and my email is gary@example.com" 'LIKELIHOOD_UNSPECIFIED' '0' 'PHONE_NUMBER' "gary@example\\.com"`
    );
    assert.match(output, /Info type: CUSTOM_REGEX_0/);
  });

  it('should handle a string with no sensitive data', () => {
    const output = execSync(`node inspectString.js ${projectId} string "foo"`);
    assert.include(output, 'No findings.');
  });

  it('should report string inspection handling errors', () => {
    let output;
    try {
      output = execSync(
        `node inspectString.js ${projectId} "I'm Gary and my email is gary@example.com" 'LIKELIHOOD_UNSPECIFIED' '0' BAD_TYPE`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'BAD_TYPE');
  });

  // inspect_file
  it('should inspect a local text file', () => {
    const output = execSync(
      `node inspectFile.js ${projectId} resources/test.txt`
    );
    assert.match(output, /Info type: PHONE_NUMBER/);
    assert.match(output, /Info type: EMAIL_ADDRESS/);
  });

  it('should inspect a local text file with custom dictionary', () => {
    const output = execSync(
      `node inspectFile.js ${projectId} resources/test.txt 'LIKELIHOOD_UNSPECIFIED' '0' 'PHONE_NUMBER' "Gary,email"`
    );
    assert.match(output, /Info type: CUSTOM_DICT_0/);
  });

  it('should inspect a local text file with custom regex', () => {
    const output = execSync(
      `node inspectFile.js ${projectId} resources/test.txt 'LIKELIHOOD_UNSPECIFIED' '0' 'PHONE_NUMBER' "\\(\\d{3}\\) \\d{3}-\\d{4}"`
    );
    assert.match(output, /Info type: CUSTOM_REGEX_0/);
  });

  it('should inspect a local image file', () => {
    const output = execSync(
      `node inspectFile.js ${projectId} resources/test.png`
    );
    assert.match(output, /Info type: EMAIL_ADDRESS/);
  });

  it('should handle a local file with no sensitive data', () => {
    const output = execSync(
      `node inspectFile.js ${projectId} resources/harmless.txt`
    );
    assert.match(output, /No findings/);
  });

  it('should report local file handling errors', () => {
    let output;
    try {
      output = execSync(
        `node inspectFile.js ${projectId} resources/harmless.txt 'LIKELIHOOD_UNSPECIFIED' '0' 'BAD_TYPE'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // inspect_gcs_file_promise
  it.skip('should inspect a GCS text file', () => {
    const output = execSync(
      `node inspectGCSFile.js ${projectId} ${bucket} test.txt ${topicName} ${subscriptionName}`
    );
    assert.match(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
    assert.match(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
  });

  it.skip('should inspect multiple GCS text files', () => {
    const output = execSync(
      `node inspectGCSFile.js ${projectId} ${bucket} "*.txt" ${topicName} ${subscriptionName}`
    );
    assert.match(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
    assert.match(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
  });

  it.skip('should handle a GCS file with no sensitive data', () => {
    const output = execSync(
      `node inspectGCSFile.js ${projectId} ${bucket} harmless.txt ${topicName} ${subscriptionName}`
    );
    assert.match(output, /No findings/);
  });

  it('should report GCS file handling errors', () => {
    let output;
    try {
      output = execSync(
        `node inspectGCSFile.js ${projectId} ${bucket} harmless.txt ${topicName} ${subscriptionName} 'LIKELIHOOD_UNSPECIFIED' '0' 'BAD_TYPE'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // inspect_datastore
  it.skip('should inspect Datastore', () => {
    const output = execSync(
      `node inspectDatastore.js ${projectId} Person ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`
    );
    assert.match(output, /Found \d instance\(s\) of infoType EMAIL_ADDRESS/);
  });

  it.skip('should handle Datastore with no sensitive data', () => {
    const output = execSync(
      `node inspectDatastore.js ${projectId} Harmless ${topicName} ${subscriptionName} --namespaceId DLP -p ${dataProject}`
    );
    assert.match(output, /No findings/);
  });

  it('should report Datastore errors', () => {
    let output;
    try {
      output = execSync(
        `node inspectDatastore.js ${projectId} ${projectId} 'DLP' 'Person' ${topicName} ${subscriptionName} 'LIKELIHOOD_UNSPECIFIED' '0' 'BAD_TYPE'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // inspect_bigquery
  it.skip('should inspect a Bigquery table', () => {
    const output = execSync(
      `node inspectBigQuery.js ${projectId} integration_tests_dlp harmful ${topicName} ${subscriptionName} -p ${dataProject}`
    );
    assert.match(output, /Found \d instance\(s\) of infoType PHONE_NUMBER/);
  });

  it.skip('should handle a Bigquery table with no sensitive data', () => {
    const output = execSync(
      `node inspectBigQuery.js ${projectId} integration_tests_dlp harmless ${topicName} ${subscriptionName} -p ${dataProject}`
    );
    assert.match(output, /No findings/);
  });

  it('should report Bigquery table handling errors', () => {
    let output;
    try {
      output = execSync(
        `node inspectBigQuery.js ${projectId} ${dataProject} integration_tests_dlp harmless ${topicName} ${subscriptionName} 'LIKELIHOOD_UNSPECIFIED' '0' 'BAD_TYPE'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // CLI options
  // This test is potentially flaky, possibly because of model changes.
  it('should have a minLikelihood option', () => {
    const outputA = execSync(
      `node inspectString.js ${projectId} "My phone number is (123) 456-7890." VERY_LIKELY`
    );
    const outputB = execSync(
      `node inspectString.js ${projectId} "My phone number is (123) 456-7890." UNLIKELY`
    );
    assert.ok(outputA);
    assert.notMatch(outputA, /PHONE_NUMBER/);
    assert.match(outputB, /PHONE_NUMBER/);
  });

  it('should have a maxFindings option', () => {
    const outputA = execSync(
      `node inspectString.js ${projectId} "My email is gary@example.com and my phone number is (223) 456-7890." LIKELIHOOD_UNSPECIFIED 1`
    );
    const outputB = execSync(
      `node inspectString.js ${projectId} "My email is gary@example.com and my phone number is (223) 456-7890." LIKELIHOOD_UNSPECIFIED 2`
    );
    assert.notStrictEqual(
      outputA.includes('PHONE_NUMBER'),
      outputA.includes('EMAIL_ADDRESS')
    ); // Exactly one of these should be included
    assert.match(outputB, /PHONE_NUMBER/);
    assert.match(outputB, /EMAIL_ADDRESS/);
  });

  it('should have an option to include quotes', () => {
    const outputA = execSync(
      `node inspectString.js ${projectId} "My phone number is (223) 456-7890." '' '' '' '' false`
    );
    const outputB = execSync(
      `node inspectString.js ${projectId} "My phone number is (223) 456-7890." '' '' '' '' `
    );
    assert.ok(outputA);
    assert.notMatch(outputB, /\(223\) 456-7890/);
    assert.match(outputA, /\(223\) 456-7890/);
  });

  it('should have an option to filter results by infoType', () => {
    const outputA = execSync(
      `node inspectString.js ${projectId} "My email is gary@example.com and my phone number is (223) 456-7890."`
    );
    const outputB = execSync(
      `node inspectString.js ${projectId} "My email is gary@example.com and my phone number is (223) 456-7890." LIKELIHOOD_UNSPECIFIED 0 PHONE_NUMBER`
    );
    assert.match(outputA, /EMAIL_ADDRESS/);
    assert.match(outputA, /PHONE_NUMBER/);
    assert.notMatch(outputB, /EMAIL_ADDRESS/);
    assert.match(outputB, /PHONE_NUMBER/);
  });
});
