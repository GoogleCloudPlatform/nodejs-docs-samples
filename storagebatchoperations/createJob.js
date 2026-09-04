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

function main(projectId, jobId, bucketName, objectPrefix) {
  // [START storage_batch_create_job]

  /**
   * Create a new batch job instance.
   *
   * @param {string} projectId Your Google Cloud project ID.
   * Example: 'my-project-id'
   * @param {string} bucketName The name of your GCS bucket.
   * Example: 'your-gcp-bucket-name'
   * @param {string} jobId A unique identifier for this job.
   * Example: '94d60cc1-2d95-41c5-b6e3-ff66cd3532d5'
   * @param {string} objectPrefix The prefix of objects to include in the operation.
   * Example: 'prefix1'
   */

  // Imports the Control library
  const {StorageBatchOperationsClient} =
    require('@google-cloud/storagebatchoperations').v1;

  // Instantiates a client
  const client = new StorageBatchOperationsClient();

  async function createJob() {
    const parent = await client.locationPath(projectId, 'global');

    // Create the request
    const request = {
      parent,
      jobId,
      job: {
        bucketList: {
          buckets: [
            {
              bucket: bucketName,
              prefixList: {
                includedObjectPrefixes: [objectPrefix],
              },
            },
          ],
        },
        deleteObject: {
          permanentObjectDeletionEnabled: false,
        },
      },
    };

    try {
      // Run the request, which returns an Operation object
      const [operation] = await client.createJob(request);
      console.log(`Waiting for operation ${operation.name} to complete...`);

      // Wait for the operation to complete and get the final resource
      const [response] = await operation.promise();
      console.log(`Created job: ${response.name}`);
    } catch (error) {
      console.error('Failed to create batch job:', error.message);
      throw error;
    }
  }

  createJob();
  // [END storage_batch_create_job]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
