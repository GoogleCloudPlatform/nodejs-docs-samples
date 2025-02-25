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
const uuid = require('uuid');
const {PubSub} = require('@google-cloud/pubsub');
const DLP = require('@google-cloud/dlp');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const {MOCK_DATA} = require('./mockdata');

const pubsub = new PubSub();
const client = new DLP.DlpServiceClient();

// Dummy resource names used in test cases mocking API Calls.
const datasetId = 'MOCK_DATASET_ID';
const sourceTableId = 'MOCK_SOURCE_TABLE';
const outputTableId = 'MOCK_OUTPUT_TABLE';

/*
 * The tests in this file rely on a table in BigQuery entitled
 * "integration_tests_dlp.harmful" with the following fields:
 *
 * Age NUMERIC NULLABLE
 * Name STRING NULLABLE
 *
 * Insert into this table a few rows of Age/Name pairs.
 */
describe('risk', () => {
  let projectId;
  // Create new custom topic/subscription
  let topic, subscription, topicName, subscriptionName, jobName;

  before(async () => {
    topicName = `dlp-risk-topic-${uuid.v4()}-${Date.now()}`;
    subscriptionName = `dlp-risk-subscription-${uuid.v4()}-${Date.now()}`;
    projectId = await client.getProjectId();
    [topic] = await pubsub.createTopic(topicName);
    [subscription] = await topic.createSubscription(subscriptionName);
    await deleteOldTopics();
  });

  async function deleteOldTopics() {
    const [topics] = await pubsub.getTopics();
    const now = Date.now();
    const TEN_HOURS_MS = 1000 * 60 * 60 * 10;
    for (const topic of topics) {
      const created = Number(topic.name.split('-').pop());
      if (
        topic.name.includes('dlp-risk-topic') &&
        now - created > TEN_HOURS_MS
      ) {
        const [subscriptions] = await topic.getSubscriptions();
        for (const subscription of subscriptions) {
          console.info(`deleting ${subscription.name}`);
          await subscription.delete();
        }
        console.info(`deleting ${topic.name}`);
        await topic.delete();
      }
    }
  }

  // Delete custom topic/subscription
  after(async () => {
    await subscription.delete();
    await topic.delete();
  });

  // Delete risk analysis job created in the snippets.
  afterEach(async () => {
    sinon.restore();
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

  // dlp_k_anonymity_analysis
  it('should perform k-anonymity analysis on a single field', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [
      {name: 'AGE', infoType: {name: 0}},
      {name: 'MYSTERY', infoType: {name: 1}},
    ];
    const DATA_CONSTANTS = MOCK_DATA.K_ANONYMITY_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const kAnonymityAnalysis = proxyquire('../kAnonymityAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    await kAnonymityAnalysis(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      subscriptionName,
      'AGE,MYSTERY'
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle k-anonymity analysis errors', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [
      {name: 'AGE', infoType: {name: 0}},
      {name: 'MYSTERY', infoType: {name: 1}},
    ];
    const DATA_CONSTANTS = MOCK_DATA.K_ANONYMITY_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const kAnonymityAnalysis = proxyquire('../kAnonymityAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    try {
      await kAnonymityAnalysis(
        projectId,
        projectId,
        datasetId,
        sourceTableId,
        topicName,
        subscriptionName,
        'AGE,MYSTERY'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_numerical_stats
  it('should perform numerical risk analysis', async () => {
    const jobName = 'test-job-name';
    const numericalColumn = 'AGE';
    const DATA_CONSTANTS = MOCK_DATA.NUMERICAL_STATS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const numericalRiskAnalysis = proxyquire('../numericalRiskAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    await numericalRiskAnalysis(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
      topicName,
      subscriptionName
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle numerical risk analysis errors', async () => {
    const jobName = 'test-job-name';
    const numericalColumn = 'AGE';
    const DATA_CONSTANTS = MOCK_DATA.NUMERICAL_STATS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
      topicName,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const numericalRiskAnalysis = proxyquire('../numericalRiskAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    try {
      await numericalRiskAnalysis(
        projectId,
        projectId,
        datasetId,
        sourceTableId,
        numericalColumn,
        topicName,
        subscriptionName
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_k_map
  it('should perform k-map analysis on a single field', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [{field: {name: 'Age'}, infoType: {name: 'AGE'}}];
    const regionCode = 'US';
    const DATA_CONSTANTS = MOCK_DATA.K_MAP_ESTIMATION_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      regionCode,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const kMapEstimationAnalysis = proxyquire('../kMapEstimationAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    await kMapEstimationAnalysis(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      subscriptionName,
      regionCode,
      quasiIds[0].field.name,
      quasiIds[0].infoType.name
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle k-map analysis errors', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [{field: {name: 'Age'}, infoType: {name: 'AGE'}}];
    const regionCode = 'US';
    const DATA_CONSTANTS = MOCK_DATA.K_MAP_ESTIMATION_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      regionCode,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const kMapEstimationAnalysis = proxyquire('../kMapEstimationAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    try {
      await kMapEstimationAnalysis(
        projectId,
        projectId,
        datasetId,
        sourceTableId,
        topicName,
        subscriptionName,
        regionCode,
        quasiIds[0].field.name,
        quasiIds[0].infoType.name
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_l_diversity
  it('should perform l-diversity analysis on a single field', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [
      {name: 'AGE', infoType: {name: 0}},
      {name: 'MYSTERY', infoType: {name: 1}},
    ];
    const sensitiveAttribute = 'AGE';
    const DATA_CONSTANTS = MOCK_DATA.L_DIVERSITY_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      sensitiveAttribute,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const lDiversityAnalysis = proxyquire('../lDiversityAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    await lDiversityAnalysis(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      subscriptionName,
      sensitiveAttribute,
      'AGE,MYSTERY'
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle l-diversity analysis errors', async () => {
    const jobName = 'test-job-name';
    const quasiIds = [
      {name: 'AGE', infoType: {name: 0}},
      {name: 'MYSTERY', infoType: {name: 1}},
    ];
    const sensitiveAttribute = 'AGE';
    const DATA_CONSTANTS = MOCK_DATA.L_DIVERSITY_ANALYSIS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      topicName,
      sensitiveAttribute,
      quasiIds,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const lDiversityAnalysis = proxyquire('../lDiversityAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    try {
      await lDiversityAnalysis(
        projectId,
        projectId,
        datasetId,
        sourceTableId,
        topicName,
        subscriptionName,
        sensitiveAttribute,
        'AGE,MYSTERY'
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_categorical_stats
  it('should perform categorical risk analysis on a string field', async () => {
    const jobName = 'test-job-name';
    const numericalColumn = 'NAME';
    const DATA_CONSTANTS = MOCK_DATA.CATEGORICAL_STATS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const categoricalRiskAnalysis = proxyquire(
      '../categoricalRiskAnalysis.js',
      {
        '@google-cloud/dlp': {DLP: DLP},
        '@google-cloud/pubsub': {PubSub: PubSub},
      }
    );
    await categoricalRiskAnalysis(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
      topicName,
      subscriptionName
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if categorical risk analysis job fails', async () => {
    const jobName = 'test-job-name';
    const numericalColumn = 'NAME';
    const DATA_CONSTANTS = MOCK_DATA.CATEGORICAL_STATS(
      projectId,
      projectId,
      datasetId,
      sourceTableId,
      numericalColumn,
      topicName,
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
      DATA_CONSTANTS.RESPONSE_GET_DLP_JOB_SUCCESS
    );
    sinon.replace(DLP.DlpServiceClient.prototype, 'getDlpJob', mockGetDlpJob);
    const mockConsoleLog = sinon.stub();
    sinon.replace(console, 'log', mockConsoleLog);

    const categoricalRiskAnalysis = proxyquire('../categoricalRiskAnalysis', {
      '@google-cloud/dlp': {DLP: DLP},
      '@google-cloud/pubsub': {PubSub: PubSub},
    });
    try {
      await categoricalRiskAnalysis(
        projectId,
        projectId,
        datasetId,
        sourceTableId,
        numericalColumn,
        topicName,
        subscriptionName
      );
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_k_anonymity_with_entity_id
  it('should perform k-map analysis using entity ID', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.K_ANONYMITY_WITH_ENTITY_ID(
      projectId,
      datasetId,
      sourceTableId,
      outputTableId,
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

    const kAnonymityWithEntityIds = proxyquire('../kAnonymityWithEntityIds', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    await kAnonymityWithEntityIds(
      projectId,
      datasetId,
      sourceTableId,
      outputTableId
    );
    sinon.assert.calledOnceWithExactly(
      mockCreateDlpJob,
      DATA_CONSTANTS.REQUEST_CREATE_DLP_JOB
    );
    sinon.assert.calledOnce(mockGetDlpJob);
  });

  it('should handle error if risk job fails', async () => {
    const jobName = 'test-job-name';
    const DATA_CONSTANTS = MOCK_DATA.K_ANONYMITY_WITH_ENTITY_ID(
      projectId,
      datasetId,
      sourceTableId,
      outputTableId,
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

    const kAnonymityWithEntityIds = proxyquire('../kAnonymityWithEntityIds', {
      '@google-cloud/dlp': {DLP: DLP},
    });
    await kAnonymityWithEntityIds(
      projectId,
      datasetId,
      sourceTableId,
      outputTableId
    );
    sinon.assert.calledOnce(mockGetDlpJob);
    sinon.assert.calledWithMatch(
      mockConsoleLog,
      'Job Failed, Please check the configuration.'
    );
  });
});
