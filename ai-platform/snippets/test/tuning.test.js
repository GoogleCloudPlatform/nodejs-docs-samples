// Copyright 2023 Google LLC
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

/* eslint-disable */

'use strict';

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid')
const sinon = require('sinon');

const aiplatform = require('@google-cloud/aiplatform');
const storage = require('@google-cloud/storage');

const clientOptions = {
  apiEndpoint: 'europe-west4-aiplatform.googleapis.com',
};

const pipelineClient = new aiplatform.v1.PipelineServiceClient(clientOptions);

const {tuneModel} = require('../tuning');

const projectId = process.env.CAIP_PROJECT_ID;
const timestampId = `${new Date().toISOString().replace(/(:|\.)/g, '-').toLowerCase()}`
const pipelineJobName = `my-tuning-pipeline-${timestampId}`
const modelDisplayName = `my-tuned-model-${timestampId}`
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const bucketUri = `gs://${bucketName}/tune-model`

describe('Tune a model', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all(files.map(file => bucket.upload(file.localPath)));
  });

  after(async () => {
    const bucket = storage.bucket(bucketName);
    await bucket.deleteFiles({force: true});
    await bucket.delete();

    // Cancel and delete the pipeline job
    const name = pipelineServiceClient.pipelineJobPath(
      project,
      location,
      pipelineJobName
    );

    const cancelRequest = {
      name,
    };

    pipelineServiceClient.cancelPipeline(cancelRequest).then(() => {
      const deleteRequest = {
        name,
      };

      return pipelineServiceClient.deletePipeline(deleteRequest);
    });
  });
  
  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should prompt-tune an existing model', async () => {
    // Act
    await tuneModel(projectId, pipelineJobName, modelDisplayName, bucketUri);

    // Assert
    assert.include(console.log.firstCall.args, 'Tuning pipeline job:');
  });
});