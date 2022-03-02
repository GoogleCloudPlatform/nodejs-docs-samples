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

async function main(projectId, jobName) {
  // [START storagetransfer_get_latest_transfer_operation]

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

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Checks the latest transfer operation for a given transfer job.
   */
  async function checkLatestTransferOperation() {
    const [transferJob] = await client.getTransferJob({projectId, jobName});

    if (transferJob.latestOperationName) {
      const [transferOperation] = await client.operationsClient.getOperation({
        name: transferJob.latestOperationName,
      });

      const operation = JSON.stringify(transferOperation, null, 2);

      console.log(`Latest transfer operation for '${jobName}': ${operation}`);
    } else {
      console.log(`Transfer job '${jobName}' has not ran yet.`);
    }
  }

  checkLatestTransferOperation();
  // [END storagetransfer_get_latest_transfer_operation]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
