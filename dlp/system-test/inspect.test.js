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
const {describe, it, before, after, afterEach} = require('mocha');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const cp = require('child_process');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const uuid = require('uuid');
const DLP = require('@google-cloud/dlp');

const {MOCK_DATA} = require('./mockdata');
const bucket = 'nodejs-dlp-test-bucket';
const dataProject = 'bigquery-public-data';
const datasetId = 'samples';
const tableId = 'github_nested';

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new DLP.DlpServiceClient();
describe('inspect', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  let topic, subscription, jobName;
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

  // Delete DLP job created in the snippets.
  afterEach(async () => {
    sinon.restore();
    if (!jobName) return;
    const request = {
      name: jobName,
    };

    client
      .deleteDlpJob(request)
      .then(() => {
        console.log(`Successfully deleted job ${jobName}.`);
      })
      .catch(err => {
        throw `Error in deleteJob: ${err.message || err}`;
      });
  });

  // inspect_string
  it('should inspect a string', () => {
    const output = execSync(
      `node inspectString.js ${projectId} "I'm Gary and my email is gary@example.com"`
    );
    assert.match(output, /Info type: EMAIL_ADDRESS/);
  });

  // inspect_string
  it('should inspect a string using a regional endpoint', () => {
    const output = execSync(
      `node inspectStringRep.js ${projectId} us-west1 "I'm Gary and my email is gary@example.com"`
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

  // CLI options
  // This test is potentially flaky, possibly because of model changes.
  // FIXME: skipping flay tests for now; this is the current output:
  // outputA:
  // Findings:
  //         Info type: PHONE_NUMBER
  //         Likelihood: VERY_LIKELY
  //
  // outputB:
  // Findings:
  //         Info type: PHONE_NUMBER
  //         Likelihood: VERY_LIKELY
  it.skip('should have a minLikelihood option', () => {
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

  // FIXME: skipping flay tests for now; this is the current output:
  // outputA:
  // Findings:
  //         Info type: PERSON_NAME
  //         Likelihood: LIKELY
  //
  // outputB:
  // Findings:
  //         Info type: PERSON_NAME
  //         Likelihood: LIKELY
  //         Info type: EMAIL_ADDRESS
  //         Likelihood: VERY_LIKELY
  it.skip('should have a maxFindings option', () => {
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

  // dlp_inspect_custom_regex
  it('should inspect a string using custom regex', () => {
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{1}-[1-9]{5}';
    const output = execSync(
      `node inspectWithCustomRegex.js ${projectId} "${string}" "${custRegex}"`
    );
    assert.match(output, /InfoType: C_MRN/);
    assert.match(output, /Likelihood: POSSIBLE/);
  });

  it('should handle string with no match', () => {
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{2}-[1-9]{5}';
    const output = execSync(
      `node inspectWithCustomRegex.js ${projectId} "${string}" "${custRegex}"`
    );
    assert.include(output, 'No findings');
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{2}-[1-9]{5}';
    try {
      output = execSync(
        `node inspectWithCustomRegex.js BAD_PROJECT_ID "${string}" "${custRegex}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_phone_number
  it('should inspect a string with phone numbers', () => {
    const output = execSync(
      `node inspectPhoneNumber.js ${projectId} "My email is gary@example.com and my phone number is (223) 456-7890." POSSIBLE 2 PHONE_NUMBER '' true`
    );
    assert.match(output, /PHONE_NUMBER/);
  });

  it('should inspect a string with no phone numbers', () => {
    const output = execSync(
      `node inspectPhoneNumber.js ${projectId} "My email is gary@example.com" POSSIBLE 2 PHONE_NUMBER '' true`
    );
    assert.include(output, 'No findings');
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        `node inspectPhoneNumber.js ${projectId} "My email is gary@example.com" POSSIBLE 2 BAD_TYPE '' true`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_hotword_rule
  it('should inspect a string using hotword rule', () => {
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{1}-[1-9]{5}';
    const output = execSync(
      `node inspectWithHotwordRules.js ${projectId} "${string}" UNLIKELY 0 "" ${custRegex} true "(?i)(mrn|medical)(?-i)"`
    );
    assert.match(output, /Info type: CUSTOM_REGEX_0/);
    assert.match(output, /Likelihood: VERY_LIKELY/);
  });

  it('should not update the likelihood if proximity criteria not satisfied', () => {
    const string = 'Patients MRN is updated to 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{1}-[1-9]{5}';
    const output = execSync(
      `node inspectWithHotwordRules.js ${projectId} "${string}" UNLIKELY 0 "" ${custRegex} true "(?i)(mrn|medical)(?-i)"`
    );
    assert.match(output, /Likelihood: POSSIBLE/);
  });

  it('should handle string with no match', () => {
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{2}-[1-9]{5}';
    const output = execSync(
      `node inspectWithHotwordRules.js ${projectId} "${string}" UNLIKELY 0 "" ${custRegex} true "(?i)(mrn|medical)(?-i)"`
    );
    assert.include(output, 'No findings');
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    const string = 'Patients MRN 444-5-22222';
    const custRegex = '[1-9]{3}-[1-9]{2}-[1-9]{5}';
    try {
      output = execSync(
        `node inspectWithHotwordRules.js ${projectId} "${string}" UNLIKELY 0 BAD_TYPE ${custRegex} true "(?i)(mrn|medical)(?-i)"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_custom_omit_overlap
  it('should omit overlapping findings between custom match and Person Name', () => {
    const output = execSync(
      `node inspectStringCustomOmitOverlap.js ${projectId} "Name: Jane Doe. Name: Larry Page."`
    );
    assert.match(output, /Quote: Jane Doe/);
    assert.notMatch(output, /Quote: Larry Page/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringCustomOmitOverlap.js BAD_PROJECT_ID "Name: Jane Doe. Name: Larry Page."'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_without_overlap
  it('should omit overlapping findings between Domain and Email Address', () => {
    const output = execSync(
      `node inspectStringWithoutOverlap.js ${projectId} "example.com is a domain, james@example.org is an email."`
    );
    assert.match(output, /Findings: 1/);
    assert.match(output, /InfoType: DOMAIN_NAME/);
    assert.match(output, /Quote: example.com/);
    assert.notMatch(output, /Quote: example.org/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringWithoutOverlap.js BAD_PROJECT_ID "example.com is a domain, james@example.org is an email."'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_omit_overlap
  it('should omit overlapping findings during inspection', () => {
    const output = execSync(
      `node inspectStringOmitOverlap.js ${projectId} "james@example.com"`
    );
    assert.match(output, /Findings: 1/);
    assert.match(output, /InfoType: EMAIL_ADDRESS/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringOmitOverlap.js BAD_PROJECT_ID "james@example.com"'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_with_exclusion_dict
  it('should inspect using exclusion word list', () => {
    const output = execSync(
      `node inspectStringWithExclusionDict.js ${projectId} "Some email addresses: gary@example.com, example@example.com" EMAIL_ADDRESS "example@example.com"`
    );
    assert.match(output, /Quote: gary@example.com/);
    assert.notMatch(output, /Quote: example@example.com/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        `node inspectStringWithExclusionDict.js ${projectId} "Some email addresses: gary@example.com, example@example.com" BAD_TYPE "example@example.com"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_with_exclusion_dict_substring
  it('should inspect using exclusion word list (substring)', () => {
    const output = execSync(
      `node inspectStringWithExclusionDictSubstring.js ${projectId} "Some email addresses: gary@example.com, TEST@example.com" TEST`
    );
    assert.notMatch(output, /Quote: TEST@example.com/);
    assert.match(output, /Quote: gary@example.com/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringWithExclusionDictSubstring.js BAD_PROJECT_ID "Some email addresses: gary@example.com, TEST@example.com" TEST'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_bigquery_with_sampling
  it('should inspect a Bigquery table with sampling', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_WITH_SAMPLING(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());
    const inspectBigqueryWithSampling = proxyquire(
      '../inspectBigQueryTableWithSampling',
      {
        '@google-cloud/dlp': {
          DLP: DLP,
        },
        '@google-cloud/pubsub': {
          PubSub: PubSub,
        },
      }
    );
    await inspectBigqueryWithSampling(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      subscriptionName
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle errors while creating inspection job', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_WITH_SAMPLING(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      jobName
    );
    const mockCreateDlpJob = sinon
      .stub()
      .rejects(new Error('Error while creating job'));

    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockErrorHandler = sinon.stub();
    sinon.replace(process, 'on', mockErrorHandler);
    sinon.replace(console, 'log', () => sinon.stub());
    const inspectBigqueryWithSampling = proxyquire(
      '../inspectBigQueryTableWithSampling',
      {
        '@google-cloud/dlp': {
          DLP: DLP,
        },
        '@google-cloud/pubsub': {
          PubSub: PubSub,
        },
      }
    );
    try {
      await inspectBigqueryWithSampling(
        projectId,
        dataProject,
        datasetId,
        tableId,
        topicName,
        subscriptionName
      );
    } catch (error) {
      console.log(error);
    }
    sinon.assert.calledOnce(mockErrorHandler);
    sinon.assert.notCalled(mockGetDlpJob);
  });

  // dlp_inspect_string_multiple_rules
  it('should inspect using multiple rules (Patient rule)', () => {
    const output = execSync(
      `node inspectStringMultipleRules.js ${projectId} "patient: Jane Doe"`
    );
    assert.match(output, /Quote: Jane Doe/);
    assert.match(output, /Likelihood: VERY_LIKELY/);
  });

  it('should inspect using multiple rules (Doctor rule)', () => {
    const output = execSync(
      `node inspectStringMultipleRules.js ${projectId} "doctor: Jane Doe"`
    );
    assert.match(output, /No findings./);
  });

  it('should inspect using multiple rules (Quasimodo rule)', () => {
    const output = execSync(
      `node inspectStringMultipleRules.js ${projectId} "patient: Quasimodo"`
    );
    assert.match(output, /No findings./);
  });

  it('should inspect using multiple rules (Redacted rule)', () => {
    const output = execSync(
      `node inspectStringMultipleRules.js ${projectId} "patient: REDACTED"`
    );
    assert.match(output, /No findings./);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringMultipleRules.js BAD_PROJECT_ID "patient: Jane Doe"'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_gcs_with_sampling
  it('should inspect a GCS file with sampling', async () => {
    const jobName = 'test-job-name';
    const gcsUri = 'test-uri';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_WITH_SAMPLING(
      projectId,
      gcsUri,
      topicName,
      infoTypes,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectGcsWithSampling = proxyquire('../inspectGcsFileWithSampling', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    await inspectGcsWithSampling(
      projectId,
      gcsUri,
      topicName,
      subscriptionName,
      'PERSON_NAME'
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error while inspecting GCS file', async () => {
    const jobName = 'test-job-name';
    const gcsUri = 'test-uri';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_WITH_SAMPLING(
      projectId,
      gcsUri,
      topicName,
      infoTypes,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectGcsWithSampling = proxyquire('../inspectGcsFileWithSampling', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    try {
      await inspectGcsWithSampling(
        projectId,
        gcsUri,
        topicName,
        subscriptionName,
        'PERSON_NAME'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_inspect_image_all_infotypes
  it('should inspect a local image file for all sensitive data', () => {
    const output = execSync(
      `node inspectImageFileAllInfoTypes.js ${projectId} resources/test.png`
    );
    assert.match(output, /InfoType: PHONE_NUMBER/);
    assert.match(output, /InfoType: EMAIL_ADDRESS/);
  });

  it('should handle error while inspecting a local image file', () => {
    let output = '';
    try {
      output = execSync(
        'node inspectImageFileAllInfoTypes.js BAD_PROJECT_ID resources/test.png'
      );
    } catch (error) {
      output = error.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_custom_excluding_substring
  it('should inspect using custom regex pattern excluding list of words', () => {
    const output = execSync(
      `node inspectStringCustomExcludingSubstring.js ${projectId} "Name: Doe, John. Name: Example, Jimmy" Jimmy`
    );
    assert.notMatch(output, /Quote: Jimmy/);
    assert.match(output, /Quote: Doe, John/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringCustomExcludingSubstring.js BAD_PROJECT_ID "Name: Doe, John. Name: Example, Jimmy" Jimmy'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_custom_hotword
  it('should inspect using custom regex pattern excluding list of words', () => {
    const output = execSync(
      `node inspectStringCustomHotword.js ${projectId} "patient name: John Doe" "patient"`
    );
    assert.match(output, /Likelihood: VERY_LIKELY/);
    assert.match(output, /Quote: John Doe/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringCustomHotword.js BAD_PROJECT_ID "patient name: John Doe" "patient"'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_string_with_exclusion_regex
  it('should inspect using exclusion regex', () => {
    const output = execSync(
      `node inspectStringWithExclusionRegex.js ${projectId} "Some email addresses: gary@example.com, bob@example.org" ".+@example.com"`
    );
    assert.match(output, /Quote: bob@example.org/);
    assert.notMatch(output, /Quote: gary@example.com/);
  });

  it('should report any errors while inspecting a string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringWithExclusionRegex.js BAD_PROJECT_ID "Some email addresses: gary@example.com, bob@example.org" ".+@example.com"'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_image_file
  it('should inspect a image file for matching infoTypes', () => {
    const output = execSync(
      `node inspectImageFile.js ${projectId} "resources/test.png"`
    );
    assert.match(output, /Findings: 2/);
    assert.match(output, /InfoType: EMAIL_ADDRESS/);
    assert.match(output, /InfoType: PHONE_NUMBER/);
  });

  it('should report any error while inspecting a image file', () => {
    let output;
    try {
      output = execSync(`node inspectImageFile.js ${projectId} INVALID_PATH`);
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_PATH');
  });

  // dlp_inspect_image_listed_infotypes
  it('should inspect a image file for matching infoTypes', () => {
    const output = execSync(
      `node inspectImageFileListedInfoTypes.js ${projectId} "resources/test.png"`
    );
    assert.match(output, /Findings: 2/);
    assert.match(output, /InfoType: EMAIL_ADDRESS/);
    assert.match(output, /InfoType: PHONE_NUMBER/);
  });

  it('should report any error while inspecting a image file', () => {
    let output;
    try {
      output = execSync(
        `node inspectImageFileListedInfoTypes.js ${projectId} INVALID_PATH`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_PATH');
  });

  // dlp_inspect_gcs_send_to_scc
  it('should inspect a GCS file and send results to SCC', async () => {
    const jobName = 'test-job-name';
    const gcsUri = 'test-uri';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_SEND_TO_SCC(
      projectId,
      gcsUri,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectGcsSendToScc = proxyquire('../inspectGcsSendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectGcsSendToScc(projectId, gcsUri);
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if inspect job results into failure', async () => {
    const jobName = 'test-job-name';
    const gcsUri = 'test-uri';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_SEND_TO_SCC(
      projectId,
      gcsUri,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectGcsSendToScc = proxyquire('../inspectGcsSendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectGcsSendToScc(projectId, gcsUri);
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });

  // dlp_inspect_bigquery_send_to_scc
  it('should inspect bigquery table and send results to SCC', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_SEND_TO_SCC(
      projectId,
      dataProject,
      datasetId,
      tableId,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectBigquerySendToScc = proxyquire('../inspectBigquerySendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectBigquerySendToScc(projectId, dataProject, datasetId, tableId);
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if inspect job results into failure', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_SEND_TO_SCC(
      projectId,
      dataProject,
      datasetId,
      tableId,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectBigQuerySendToScc = proxyquire('../inspectBigquerySendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectBigQuerySendToScc(projectId, dataProject, datasetId, tableId);
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });

  // dlp_inspect_datastore_send_to_scc
  it('should inspect datastore and send results to SCC', async () => {
    const jobName = 'test-job-name';
    const datastoreNamespace = 'datastore-namespace';
    const datastoreKind = 'datastore-kind';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_DATASTORE_SEND_TO_SCC(
      projectId,
      datastoreNamespace,
      datastoreKind,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectDatastoreSendToScc = proxyquire(
      '../inspectDatastoreSendToScc',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    await inspectDatastoreSendToScc(
      projectId,
      datastoreNamespace,
      datastoreKind
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if inspect job results into failure', async () => {
    const jobName = 'test-job-name';
    const datastoreNamespace = 'datastore-namespace';
    const datastoreKind = 'datastore-kind';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_DATASTORE_SEND_TO_SCC(
      projectId,
      datastoreNamespace,
      datastoreKind,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectDatastoreSendToScc = proxyquire(
      '../inspectDatastoreSendToScc',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    await inspectDatastoreSendToScc(
      projectId,
      datastoreNamespace,
      datastoreKind
    );
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });

  // dlp_inspect_table
  it('should inspect table with PERSON_NAME infotype', () => {
    const output = execSync(`node inspectTable.js ${projectId}`);
    assert.match(output, /Quote: \(206\) 555-0123/);
    assert.match(output, /Findings: 1/);
  });

  it('should report any errors while inspecting a table', () => {
    let output;
    try {
      output = execSync('node inspectTable.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_augment_infotypes
  it('should inspect a string using augmented infotype', () => {
    const output = execSync(
      `node inspectStringAugmentInfoType.js ${projectId} "The patient's name is quasimodo" 'quasimodo'`
    );
    assert.match(output, /InfoType: PERSON_NAME/);
    assert.match(output, /Quote: quasimodo/);
  });

  it('should handle errors while inspecting the string', () => {
    let output;
    try {
      output = execSync(
        'node inspectStringAugmentInfoType.js BAD_PROJECT_ID "The patient\'s name is quasimodo" "quasimodo"'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_column_values_w_custom_hotwords
  it('should inspect a table excluding findings in a particular row', () => {
    const output = execSync(`node inspectWithCustomHotwords.js ${projectId}`);
    assert.match(output, /Findings: 1/);
    assert.match(output, /Quote: 222-22-2222/);
    assert.notMatch(output, /Quote: 111-11-1111/);
  });

  it('should handle errors while inspecting the table', () => {
    let output;
    try {
      output = execSync('node inspectWithCustomHotwords.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_inspect_with_stored_infotype
  it('should inspect a string using stored infotype', async () => {
    const string =
      'My phone number is (223) 456-7890 and my email address is gary@example.com.';
    const infoTypeId = 'MOCK_INFOTYPE';

    const DATA_CONSTANTS = MOCK_DATA.INSPECT_WITH_STORED_INFOTYPE(
      projectId,
      string,
      infoTypeId
    );
    const mockInspectContent = sinon
      .stub()
      .resolves(DATA_CONSTANTS.RESPONSE_INSPECT_CONTENT);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'inspectContent',
      mockInspectContent
    );
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectWithStoredInfotype = proxyquire(
      '../inspectWithStoredInfotype',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    await inspectWithStoredInfotype(projectId, infoTypeId, string);
    sinon.assert.calledOnceWithExactly(
      mockInspectContent,
      DATA_CONSTANTS.REQUEST_INSPECT_CONTENT
    );
  });

  it('should handle error while inspecting the string', async () => {
    const string =
      'My phone number is (223) 456-7890 and my email address is gary@example.com.';
    const infoTypeId = 'MOCK_INFOTYPE';
    const mockInspectContent = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'inspectContent',
      mockInspectContent
    );
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectWithStoredInfotype = proxyquire(
      '../inspectWithStoredInfotype',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );

    try {
      await inspectWithStoredInfotype(projectId, infoTypeId, string);
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_inspect_send_data_to_hybrid_job_trigger
  it('should inspect data using hybrid job trigger that is inactive', async () => {
    const jobName = 'test-job-name';
    const string = 'My email is test@example.org';
    const jobTriggerId = 'MOCK_JOB_TRIGGER_ID';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_SEND_DATA_TO_HYBRID_JOB_TRIGGER(
      projectId,
      string,
      jobTriggerId,
      jobName
    );

    const mockHybridInspectJobTrigger = sinon
      .stub()
      .resolves([{name: jobName}]);
    const mockActivateJobTrigger = sinon.stub().resolves([{name: jobName}]);
    const mockFinishDlpJob = sinon.stub().resolves();
    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    const mockConsoleLog = sinon.stub();

    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'hybridInspectJobTrigger',
      mockHybridInspectJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'activateJobTrigger',
      mockActivateJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'finishDlpJob',
      mockFinishDlpJob
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectDataToHybridJobTrigger = proxyquire(
      '../inspectDataToHybridJobTrigger.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );
    await inspectDataToHybridJobTrigger(projectId, string, jobTriggerId);
    sinon.assert.calledOnceWithExactly(
      mockHybridInspectJobTrigger,
      DATA_CONSTANTS.REQUEST_HYBRID_INSPECT_JOB_TRIGGER
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should inspect data using hybrid job trigger that is active', async () => {
    const jobName = 'test-job-name';
    const string = 'My email is test@example.org';
    const jobTriggerId = 'MOCK_JOB_TRIGGER_ID';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_SEND_DATA_TO_HYBRID_JOB_TRIGGER(
      projectId,
      string,
      jobTriggerId,
      jobName
    );

    const mockHybridInspectJobTrigger = sinon
      .stub()
      .resolves([{name: jobName}]);
    const mockActivateJobTrigger = sinon.stub().rejects({code: 3});
    const mockFinishDlpJob = sinon.stub().resolves();
    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    const mockConsoleLog = sinon.stub();
    const mockListDlpJobs = sinon.stub().resolves([[{name: jobName}]]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'hybridInspectJobTrigger',
      mockHybridInspectJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'activateJobTrigger',
      mockActivateJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'finishDlpJob',
      mockFinishDlpJob
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'listDlpJobs',
      mockListDlpJobs
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectDataToHybridJobTrigger = proxyquire(
      '../inspectDataToHybridJobTrigger.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );
    await inspectDataToHybridJobTrigger(projectId, string, jobTriggerId);
    sinon.assert.calledOnceWithExactly(
      mockHybridInspectJobTrigger,
      DATA_CONSTANTS.REQUEST_HYBRID_INSPECT_JOB_TRIGGER
    );
    sinon.assert.calledOnceWithExactly(
      mockListDlpJobs,
      DATA_CONSTANTS.REQUEST_LIST_DLP_JOBS
    );
  });

  it('should handle error if hybrid job inspection fails', async () => {
    const jobName = 'test-job-name';
    const string = 'My email is test@example.org';
    const jobTriggerId = 'MOCK_JOB_TRIGGER_ID';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_SEND_DATA_TO_HYBRID_JOB_TRIGGER(
      projectId,
      string,
      jobTriggerId,
      jobName
    );

    const mockHybridInspectJobTrigger = sinon
      .stub()
      .resolves([{name: jobName}]);
    const mockActivateJobTrigger = sinon
      .stub()
      .resolves([{name: jobTriggerId}]);
    const mockFinishDlpJob = sinon.stub().resolves();
    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    const mockConsoleLog = sinon.stub();
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'hybridInspectJobTrigger',
      mockHybridInspectJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'activateJobTrigger',
      mockActivateJobTrigger
    );
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'finishDlpJob',
      mockFinishDlpJob
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectDataToHybridJobTrigger = proxyquire(
      '../inspectDataToHybridJobTrigger.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
      }
    );
    await inspectDataToHybridJobTrigger(projectId, string, jobTriggerId);
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });
  // dlp_inspect_gcs
  it('should inspect a GCS file', async () => {
    const jobName = 'test-job-name';
    const fileName = 'test-file';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_FILE(
      projectId,
      bucket,
      fileName,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectGCSFile = proxyquire('../inspectGCSFile', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    await inspectGCSFile(
      projectId,
      bucket,
      fileName,
      topicName,
      subscriptionName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      'PERSON_NAME',
      undefined,
      jobName
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error while inspecting GCS file', async () => {
    const jobName = 'test-job-name';
    const fileName = 'test-file';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_GCS_FILE(
      projectId,
      bucket,
      fileName,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectGCSFile = proxyquire('../inspectGCSFile', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    try {
      await inspectGCSFile(
        projectId,
        bucket,
        fileName,
        topicName,
        subscriptionName,
        DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
        0,
        'PERSON_NAME',
        undefined,
        jobName
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_inspect_bigquery
  it('should inspect a bigquery table', async () => {
    const jobName = 'test-job-name';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectBigQuery = proxyquire('../inspectBigQuery', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    await inspectBigQuery(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      subscriptionName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      'PERSON_NAME',
      undefined
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error while inspecting big query table', async () => {
    const jobName = 'test-job-name';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY(
      projectId,
      dataProject,
      datasetId,
      tableId,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectBigQuery = proxyquire('../inspectBigQuery', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    try {
      await inspectBigQuery(
        projectId,
        dataProject,
        datasetId,
        tableId,
        topicName,
        subscriptionName,
        DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
        0,
        'PERSON_NAME',
        undefined
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_inspect_datastore
  it('should inspect a datastore instance', async () => {
    const jobName = 'test-job-name';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const nameSpaceId = 'MOCK_NAMESPACE_ID';
    const kind = 'MOCK_KIND';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_DATASTORE(
      projectId,
      dataProject,
      nameSpaceId,
      kind,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectDatastore = proxyquire('../inspectDatastore', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    await inspectDatastore(
      projectId,
      dataProject,
      nameSpaceId,
      kind,
      topicName,
      subscriptionName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      'PERSON_NAME',
      undefined
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error while inspecting datastore instance', async () => {
    const jobName = 'test-job-name';
    const infoTypes = [{name: 'PERSON_NAME'}];
    const nameSpaceId = 'MOCK_NAMESPACE_ID';
    const kind = 'MOCK_KIND';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_DATASTORE(
      projectId,
      dataProject,
      nameSpaceId,
      kind,
      topicName,
      DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      0,
      infoTypes,
      undefined,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );
    const topicHandlerStub = sinon.stub().returns({
      get: sinon.stub().resolves([
        {
          subscription: sinon.stub().resolves({
            removeListener: sinon.stub(),
            on: sinon
              .stub()
              .withArgs('message')
              .callsFake((eventName, handler) => {
                handler(DATA_CONSTANTS.MOCK_MESSAGE);
              }),
          }),
        },
      ]),
    });
    sinon.replace(PubSub.prototype, 'topic', topicHandlerStub);

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    sinon.replace(console, 'log', () => sinon.stub());

    const inspectDatastore = proxyquire('../inspectDatastore', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });

    try {
      await inspectDatastore(
        projectId,
        dataProject,
        nameSpaceId,
        kind,
        topicName,
        subscriptionName,
        DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
        0,
        'PERSON_NAME',
        undefined
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_inspect_send_data_to_hybrid_job_trigger
  it('should inspect bigquery table and send results to SCC', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_SEND_TO_SCC(
      projectId,
      dataProject,
      datasetId,
      tableId,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectBigquerySendToScc = proxyquire('../inspectBigquerySendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectBigquerySendToScc(projectId, dataProject, datasetId, tableId);
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if inspect job results into failure', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.INSPECT_BIG_QUERY_SEND_TO_SCC(
      projectId,
      dataProject,
      datasetId,
      tableId,
      jobName
    );
    const mockCreateDlpJob = sinon.stub().resolves([{name: jobName}]);
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'createDlpJob',
      mockCreateDlpJob
    );

    const mockGetDlpJob = sinon.fake.resolves(
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_FAILED
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const inspectBigQuerySendToScc = proxyquire('../inspectBigquerySendToScc', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await inspectBigQuerySendToScc(projectId, dataProject, datasetId, tableId);
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });
});
