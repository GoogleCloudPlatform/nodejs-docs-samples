// Copyright 2025 Google LLC
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
 * This application demonstrates how to perform basic operations on an Batch Operations
 * instance with the Google Cloud Storage API.
 *
 * For more information, see the documentation at https://cloud.google.com/storage/docs/batch-operations/overview.
 */

async function main(projectId, jobId) {
  // [START storage_batch_quickstart]

  // Imports the Google Cloud client library
  const {StorageBatchOperationsClient} =
    require('@google-cloud/storagebatchoperations').v1;

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // Your Google Cloud project ID.
  // const projectId = 'my-project-id';

  // A unique identifier for this job.
  // const jobId = '94d60cc1-2d95-41c5-b6e3-ff66cd3532d5';

  // Creates a client
  const client = new StorageBatchOperationsClient();

  async function quickstart() {
    const name = client.jobPath(projectId, 'global', jobId);

    // Create the request
    const request = {
      name,
    };

    // Run request
    const [response] = await client.getJob(request);
    console.log(`Got job: ${response.name}`);
  }
  quickstart();
  // [END storage_batch_quickstart]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
