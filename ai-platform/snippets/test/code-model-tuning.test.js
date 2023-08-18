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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid');
const sinon = require('sinon');

const projectId = process.env.CAIP_PROJECT_ID;
const location = 'europe-west4';

const aiplatform = require('@google-cloud/aiplatform');
const clientOptions = {
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
};
const pipelineClient = new aiplatform.v1.PipelineServiceClient(clientOptions);

const {tuneModel} = require('../code-model-tuning');

const timestampId = `${new Date()
  .toISOString()
  .replace(/(:|\.)/g, '-')
  .toLowerCase()}`;
const pipelineJobName = `my-tuning-pipeline-${timestampId}`;
const modelDisplayName = `my-tuned-model-${timestampId}`;
const bucketName = 'ucaip-samples-europe-west4/training_pipeline_output';
const bucketUri = `gs://${bucketName}/tune-model-nodejs`;

describe('Tune a code model', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should prompt-tune an existing code model', async () => {
    // Act
    await tuneModel(projectId, pipelineJobName, modelDisplayName, bucketUri);

    // Assert
    assert.include(console.log.firstCall.args, 'Tuning pipeline job:');
  });

  after(async () => {
    // Cancel and delete the pipeline job
    const name = pipelineClient.pipelineJobPath(
      projectId,
      location,
      pipelineJobName
    );

    const cancelRequest = {
      name,
    };

    pipelineClient.cancelPipelineJob(cancelRequest).then(() => {
      const deleteRequest = {
        name,
      };

      return pipelineClient.deletePipeline(deleteRequest);
    });
  });
});
