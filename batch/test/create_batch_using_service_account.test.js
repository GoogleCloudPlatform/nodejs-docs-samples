/*
 * Copyright 2020 Google LLC
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

const assert = require('assert');
const {describe, it} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;
const {
  callCreateBatchServiceAccountJob,
} = require('../create/create_batch_using_service_account');
const {deleteJob, getJob} = require('./batchClient_operations');
const batchClient = new BatchServiceClient();
const resourceManagerClient = new ProjectsClient();

async function getProjectNumber(projectId) {
  // Construct request
  const request = {
    name: `projects/${projectId}`,
  };

  // Run request
  const [response] = await resourceManagerClient.getProject(request);
  const projectNumber = response.name.split('/')[1];
  return projectNumber;
}

describe('Create batch using service account', async () => {
  const jobName = 'batch-service-account-job';
  const region = 'europe-central2';
  let projectId, serviceAccountEmail;

  before(async () => {
    projectId = await batchClient.getProjectId();
    serviceAccountEmail = `${await getProjectNumber(projectId)}-compute@developer.gserviceaccount.com`;
  });

  afterEach(async () => {
    await deleteJob(batchClient, projectId, region, jobName);
  });

  it('should create a new job using serviceAccount', async () => {
    await callCreateBatchServiceAccountJob(
      projectId,
      region,
      jobName,
      serviceAccountEmail
    );
    const createdJob = (
      await getJob(batchClient, projectId, region, jobName)
    )[0];

    assert.equal(
      createdJob.allocationPolicy.serviceAccount.email,
      serviceAccountEmail
    );
  });
});
