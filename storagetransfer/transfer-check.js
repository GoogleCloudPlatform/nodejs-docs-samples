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
  // [START storagetransfer_transfer_check]

  // Imports the Google Cloud client library
  const {
    StorageTransferServiceClient,
    protos,
  } = require('@google-cloud/storage-transfer');

  // Proto for TransferOperation
  const TransferOperation = protos.google.storagetransfer.v1.TransferOperation;

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
   * Lists operations for a transfer job.
   */
  async function checkLatestTransferOperation() {
    const filter = JSON.stringify({
      project_id: projectId,
      job_names: [jobName],
    });

    const [operations] = await client.operationsClient.listOperations({
      name: 'transferOperations',
      filter,
    });

    console.log(`Transfer operations for ${jobName}:`);
    for (const {metadata} of operations) {
      const transferOperation = TransferOperation.decode(metadata.value);

      console.dir(transferOperation);
    }
  }

  checkLatestTransferOperation();
  // [END storagetransfer_transfer_check]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
