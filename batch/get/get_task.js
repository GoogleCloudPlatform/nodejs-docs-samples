// Copyright 2022 Google LLC
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

/**
 * Retrieves information about the specified job, most notably its status.
 *
 * @param {string} projectId - ID or number of the Google Cloud project you want to use.
 * @param {string} region - The Google Cloud region to use, e.g. 'us-central1'
 * @param {string} jobName - ID used to uniquely identify the Job within this project and region.
 *  This field should contain at most 63 characters.
 *  Only alphanumeric characters or '-' are accepted.
 *  The '-' character cannot be the first or the last one.
 * @param {string} groupName - the name of the group that owns the task you want to check.
 * Usually it's `group0`.
 * @param {number} taskNumber - number of the task you want to look up.
 */
function main(projectId, region, jobName, groupName, taskNumber) {
  // [START batch_get_task]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  /**
   * The region that hosts the job.
   */
  // const region = 'us-central-1';
  /**
   * The name of the job you want to retrieve information about.
   */
  // const jobName = 'YOUR_JOB_NAME';
  /**
   * The name of the group that owns the task you want to check.
   * Usually it's `group0`.
   */
  // const groupName = 'group0';
  /**
   * The number of the task you want to look up.
   */
  // const taskNumber = 0;

  // Imports the Batch library
  const batchLib = require('@google-cloud/batch');

  // Instantiates a client
  const batchClient = new batchLib.v1.BatchServiceClient();

  async function callGetJob() {
    // Construct request
    const request = {
      name:
        `projects/${projectId}/locations/${region}/jobs/${jobName}` +
        `/taskGroups/${groupName}/tasks/${taskNumber}`,
    };

    // Run request
    const response = await batchClient.getTask(request);
    console.log(response);
  }

  callGetJob();
  // [END batch_get_task]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
