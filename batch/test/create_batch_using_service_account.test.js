/*
 * Copyright 2024 Google LLC
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

const path = require('path');
const assert = require('node:assert/strict');
const {describe, it} = require('mocha');
const cp = require('child_process');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;

const cwd = path.join(__dirname, '..');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

async function getProjectNumber(projectId) {
  const resourceManagerClient = new ProjectsClient();
  // Construct request
  const request = {
    name: `projects/${projectId}`,
  };

  // Run request
  const [response] = await resourceManagerClient.getProject(request);
  return response.name.split('/')[1];
}

describe('Create batch job using service account', async () => {
  const jobName = 'batch-service-account-job';
  const region = 'europe-central2';
  const batchClient = new BatchServiceClient();
  let projectId, serviceAccountEmail;

  before(async () => {
    projectId = await batchClient.getProjectId();
    serviceAccountEmail = `${await getProjectNumber(projectId)}-compute@developer.gserviceaccount.com`;
  });

  afterEach(async () => {
    await batchClient.deleteJob({
      name: `projects/${projectId}/locations/${region}/jobs/${jobName}`,
    });
  });

  it('should create a new job using serviceAccount', async () => {
    const response = execSync(
      'node ./create/create_batch_using_service_account.js',
      {
        cwd,
      }
    );

    assert.equal(
      JSON.parse(response).allocationPolicy.serviceAccount.email,
      serviceAccountEmail
    );
  });
});
