// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require('path');
const cp = require('child_process');
const {describe, it, before} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {Storage} = require('@google-cloud/storage');
const {ProjectsClient} = require('@google-cloud/resource-manager').v3;
const compute = require('@google-cloud/compute');
// get a short ID for this test run that only contains characters that are valid in UUID
// (a plain UUID won't do because we want the "test-job-js" prefix and that would exceed the length limit)
const {customAlphabet} = require('nanoid');
const allowedChars = 'qwertyuiopasdfghjklzxcvbnm';
const testRunId = customAlphabet(allowedChars, allowedChars.length)();

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cwd = path.join(__dirname, '..');

const batchClient = new BatchServiceClient();
const storage = new Storage();
const resourcemanagerClient = new ProjectsClient();
const instanceTemplatesClient = new compute.InstanceTemplatesClient();

describe('Create jobs with container, template and bucket', () => {
  let projectId;
  let bucketName;
  let templateName;

  before(async () => {
    projectId = await batchClient.getProjectId();
    bucketName = `batch-js-test-bucket-${testRunId}`;
    templateName = `batch-js-test-template-${testRunId}`;
    await createBucket(bucketName);
    await createTemplate(projectId, templateName);
  });

  it('creates a job with a container payload', () => {
    execSync(
      `node create/create_with_container_no_mounting.js ${projectId} us-central1 test-job-js-container-${testRunId}`,
      {cwd}
    );
  });

  it('creates a job with a GCS bucket', () => {
    execSync(
      `node create/create_with_mounted_bucket.js ${projectId} us-central1 test-job-js-bucket-${testRunId} ${bucketName}`,
      {cwd}
    );
  });

  it('creates a job with instance template', () => {
    execSync(
      `node create/create_script_job_with_template.js ${projectId} us-central1 test-job-js-template-${testRunId} ${templateName}`,
      {cwd}
    );
  });

  // waiting for jobs to succeed in separate tests lets us create them all on the server and let them run in parallel,
  // so the tests complete multiple times faster

  it('waits for a job with a GCS bucket to succeed', async () => {
    await waitForJobToSucceed(
      projectId,
      'us-central1',
      `test-job-js-bucket-${testRunId}`
    );
  });

  it('waits for a job with a container payload to succeed', async () => {
    await waitForJobToSucceed(
      projectId,
      'us-central1',
      `test-job-js-container-${testRunId}`
    );
  });

  it('waits for a job with an instance template to succeed', async () => {
    await waitForJobToSucceed(
      projectId,
      'us-central1',
      `test-job-js-template-${testRunId}`
    );
  });

  after(async () => {
    await cleanupBucket(bucketName);
    await deleteInstanceTemplate(projectId, templateName);
  });
});

async function createBucket(bucketName) {
  // For default values see: https://cloud.google.com/storage/docs/locations and
  // https://cloud.google.com/storage/docs/storage-classes

  await storage.createBucket(bucketName, {
    location: 'US-CENTRAL1',
    storageClass: 'COLDLINE',
  });
}

async function cleanupBucket(bucketName) {
  // GCS bucket will fail to delete if it is non-empty.
  // There is no 'force=true' argument in the Node GCS client,
  // so we cannot use force deletion here and have to first delete all files,
  // and only then delete the actual bucket.
  const promises = [];
  for (let i = 0; i <= 3; i++) {
    promises.push(deleteFileInBucket(bucketName, `output_task_${i}.txt`));
  }
  await Promise.all(promises);
  await deleteBucket(bucketName);
}

async function deleteBucket(bucketName) {
  await storage.bucket(bucketName).delete();
}

async function deleteFileInBucket(bucketName, fileName) {
  await storage
    .bucket(bucketName)
    .file(fileName)
    .delete({ignoreNotFound: true});
}

async function waitForJobToSucceed(projectID, region, jobName) {
  const maxAttempts = 100;
  const pollInterval = 2000; // in milliseconds
  let succeeded = false;

  for (let i = 0; i < maxAttempts; i++) {
    const jobResponse = await getJob(projectID, region, jobName);
    const job = jobResponse[0];
    if (job.status.state === 'SUCCEEDED') {
      succeeded = true;
      break;
    } else if (job.status.state === 'FAILED') {
      throw new Error('Test job failed');
    }
    await sleep(pollInterval);
  }
  if (!succeeded) {
    throw new Error(
      'Timed out waiting for the batch job to succeed after ${maxAttempts} attempts'
    );
  }
}

async function getJob(projectId, region, jobName) {
  const request = {
    name: `projects/${projectId}/locations/${region}/jobs/${jobName}`,
  };
  return await batchClient.getJob(request);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function projectIdToNumber(projectId) {
  // Construct request
  const request = {
    name: `projects/${projectId}`,
  };

  // Run request
  const [response] = await resourcemanagerClient.getProject(request);
  const projectNumber = response.name.split('/')[1];
  return projectNumber;
}

/**
 * Creates a new instance template with the provided name and a specific instance configuration.
 * Includes all the stuff neeeded for Batch, such as service accounts.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} templateName - Name of the new template to create.
 */
async function createTemplate(projectId, templateName) {
  const projectNumber = await projectIdToNumber(projectId);
  const serviceAccountAddress = `${projectNumber}-compute@developer.gserviceaccount.com`;

  const [response] = await instanceTemplatesClient.insert({
    project: projectId,
    instanceTemplateResource: {
      name: templateName,
      properties: {
        disks: [
          {
            // The template describes the size and source image of the boot disk
            // to attach to the instance.
            initializeParams: {
              diskSizeGb: '25',
              sourceImage:
                'projects/debian-cloud/global/images/family/debian-11',
            },
            autoDelete: true,
            boot: true,
          },
        ],
        machineType: 'e2-standard-4',
        // The template connects the instance to the `default` network,
        // without specifying a subnetwork.
        networkInterfaces: [
          {
            // Use the network interface provided in the networkName argument.
            name: 'global/networks/default',
            // The template lets the instance use an external IP address.
            accessConfigs: [
              {
                name: 'External NAT',
                type: 'ONE_TO_ONE_NAT',
                networkTier: 'PREMIUM',
              },
            ],
          },
        ],
        serviceAccounts: [
          {
            email: serviceAccountAddress,
            scopes: [
              'https://www.googleapis.com/auth/devstorage.read_only',
              'https://www.googleapis.com/auth/logging.write',
              'https://www.googleapis.com/auth/monitoring.write',
              'https://www.googleapis.com/auth/servicecontrol',
              'https://www.googleapis.com/auth/service.management.readonly',
              'https://www.googleapis.com/auth/trace.append',
            ],
          },
        ],
      },
    },
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.GlobalOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
}

// Delete an instance template.
async function deleteInstanceTemplate(projectId, templateName) {
  const [response] = await instanceTemplatesClient.delete({
    project: projectId,
    instanceTemplate: templateName,
  });
  let operation = response.latestResponse;
  const operationsClient = new compute.GlobalOperationsClient();

  // Wait for the create operation to complete.
  while (operation.status !== 'DONE') {
    [operation] = await operationsClient.wait({
      operation: operation.name,
      project: projectId,
    });
  }
}
