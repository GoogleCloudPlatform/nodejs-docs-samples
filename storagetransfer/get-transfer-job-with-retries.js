/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(projectId, jobName, maxRetryDelayMillis) {
  // [START storagetransfer_create_retry_handler]

  // Imports the Google Cloud client library
  const {
    StorageTransferServiceClient,
  } = require('@google-cloud/storage-transfer');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of the Google Cloud Platform Project that owns the job
  // projectId = 'my-project-id'

  // Storage Transfer Service job name
  // jobName = 'transferJobs/1234567890'

  // The maximum delay time, in milliseconds, between requests
  // maxRetryDelayMillis = 60000

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Check the latest transfer operation associated with a transfer job
   * with retries.
   */
  async function getTransferJobWithRetries() {
    // Setting the start date and the end date as the same time creates a
    // one-time transfer

    const options = {
      retry: {
        backoffSettings: {
          maxRetryDelayMillis,
        },
      },
    };

    const [transferJob] = await client.getTransferJob(
      {projectId, jobName},
      options
    );

    console.log(
      `Fetched transfer job: ${transferJob.name} with a maximum of ${maxRetryDelayMillis}ms delay time between requests`
    );
  }

  getTransferJobWithRetries();
  // [END storagetransfer_create_retry_handler]
}

const [projectId, jobName, maxRetryDelayMillis] = [...process.argv.slice(2)];

main(projectId, jobName, Number.parseInt(maxRetryDelayMillis));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
