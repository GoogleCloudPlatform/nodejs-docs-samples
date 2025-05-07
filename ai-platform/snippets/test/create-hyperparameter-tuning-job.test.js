/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const {after, describe, it} = require('mocha');

const uuid = require('uuid').v4;
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const aiplatform = require('@google-cloud/aiplatform');
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

const jobServiceClient = new aiplatform.v1.JobServiceClient(clientOptions);

const containerImageUri =
  'gcr.io/ucaip-sample-tests/ucaip-training-test:latest';
const displayName = `temp_create_hyperparameter_tuning_job_test${uuid()}`;
const location = 'us-central1';
const project = process.env.CAIP_PROJECT_ID;

let tuningJobId;

// Image gcr.io/ucaip-sample-tests/ucaip-training-test:latest no longer exists
describe.skip('AI platform create hyperparameter tuning job', async function () {
  this.retries(2);
  it('should create a new hyperparameter tuning job', async () => {
    const stdout = execSync(
      `node ./create-hyperparameter-tuning-job.js ${displayName} ${containerImageUri} ${project} ${location}`
    );
    assert.match(
      stdout,
      /\/locations\/us-central1\/hyperparameterTuningJobs\//
    );
    tuningJobId = stdout
      .split('/locations/us-central1/hyperparameterTuningJobs/')[1]
      .split('\n')[0];
  });

  after(
    'should cancel the hyperparameter tuning job and delete it',
    async () => {
      const name = jobServiceClient.hyperparameterTuningJobPath(
        project,
        location,
        tuningJobId
      );

      const cancelRequest = {
        name,
      };

      jobServiceClient.cancelHyperparameterTuningJob(cancelRequest).then(() => {
        const deleteRequest = {
          name,
        };

        return jobServiceClient.deleteHyperparameterTuningJob(deleteRequest);
      });
    }
  );
});
