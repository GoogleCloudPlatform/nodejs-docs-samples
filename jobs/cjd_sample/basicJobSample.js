/**
 * Copyright 2018 Google LLC.
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
// [START basicJobSample]

const assert = require('assert');
const uuidv1 = require('uuid/v1');
const companySample = require('./basicCompanySample.js');
const getClient = require('./jobsClient.js').getClient;

// [START basic_job]
/**
 * Generate data for a job.
 * @param {string} companyName Name of company (value of 'name' field).
 * @returns {Object} Object containing fields of 'Job' resource.
 */
function generateJob (companyName) {
  assert(companyName, '\'companyName\' argument is required.');
  return {
    requisitionId: 'jobWithRequiredFields:' + uuidv1(),
    jobTitle: 'System administrator',
    description: 'Maintain IT network.',
    companyName: companyName,
    applicationUrls: ['https://www.foobar.com']
  };
}
exports.generateJob = generateJob;
// [END basic_job]

// [START create_job]
/**
 * Create a new job.
 * @param {Object} client Instance of google.jobs module.
 * @param {Object} jobInfo Object containing fields of 'Job' resource.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function createJob (client, jobInfo) {
  assert(jobInfo, '\'jobInfo\' argument is required.');

  return new Promise((resolve, reject) => {
    client.jobs.create({
      resource: {
        job: jobInfo
      }
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      assert(response.data, '\'data\' field not populated in response.');
      resolve(response.data);
    });
  });
}
exports.createJob = createJob;
// [END create_job]

// [START create_job]
/**
 * Get a job.
 * @param {Object} client Instance of google.jobs module.
 * @param {string} jobName Job name.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function getJob (client, jobName) {
  assert(jobName, '\'jobName\' argument is required.');

  return new Promise((resolve, reject) => {
    client.jobs.get({
      name: jobName
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
exports.getJob = getJob;
// [END create_job]

// [START update_job]
/**
 * Update a job.
 * @param {Object} client Instance of google.jobs module.
 * @param {string} jobName Job name.
 * @param {Object} jobInfo Object containing fields of 'Job' resource.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function updateJob (client, jobName, jobInfo) {
  assert(jobName, '\'jobName\' argument is required.');
  assert(jobInfo, '\'jobInfo\' argument is required.');

  return new Promise((resolve, reject) => {
    client.jobs.patch({
      name: jobName,
      resource: {
        job: jobInfo
      }
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      assert(response.data, '\'data\' field not populated in response.');
      resolve(response.data);
    });
  });
}
exports.updateJob = updateJob;
// [END update_job]

// [START delete_job]
/**
 * Delete a job.
 * @param {string} jobName Job name.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function deleteJob (client, jobName) {
  assert(jobName, '\'jobName\' argument is required.');
  return new Promise((resolve, reject) => {
    client.jobs.delete({
      name: jobName
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
exports.deleteJob = deleteJob;
// [END delete_job]

/**
 * Main entry point function.
 */
function main () {
  getClient().then((jobsClient) => {
    assert(jobsClient, 'jobs instance not found.');

    companySample.createCompany(jobsClient, companySample.generateCompany()).then((companyInfo) => {
      const companyName = companyInfo.name;
      console.log('Company name:', companyName);

      let jobInfo = generateJob(companyName);
      // Create job.
      createJob(jobsClient, jobInfo).then((info) => {
        const jobName = info.name;
        console.log('Job name:', jobName);

        // Get job.
        getJob(jobsClient, jobName).then((jobInfo) => {
          jobInfo.department = 'IT';
          jobInfo.description = 'Manage company network. Manage server infrastructure.';

          // Update job.
          updateJob(jobsClient, jobName, jobInfo).then((info) => {
            assert(jobInfo.department === info.department);
            assert(jobInfo.description === info.description);

            // Delete job.
            deleteJob(jobsClient, jobName);
          });
        });
      });
    });
  });
}

if (require.main === module) {
  main();
}
// [END basicJobSample]
