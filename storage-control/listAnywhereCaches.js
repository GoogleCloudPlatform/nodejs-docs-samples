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
//

'use strict';

/**
 * This application demonstrates how to perform basic operations on an Anywhere Cache
 * instance with the Google Cloud Storage API.
 *
 * For more information, see the documentation at https://cloud.google.com/storage/docs/anywhere-cache.
 */

function main(bucketName) {
  // [START storage_control_list_anywhere_caches]
  /**
   * Lists all Anywhere Cache instances for a Cloud Storage bucket.
   * This function helps you discover all active and pending caches associated with
   * a specific bucket, which is useful for auditing and management.
   *
   * @param {string} bucketName The name of the bucket to list caches for.
   * Example: 'your-gcp-bucket-name'
   */

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();

  async function callListAnywhereCaches() {
    const bucketPath = controlClient.bucketPath('_', bucketName);

    // Create the request
    const request = {
      parent: bucketPath,
    };

    try {
      // Run request. The response is an array where the first element is the list of caches.
      const [response] = await controlClient.listAnywhereCaches(request);

      if (response && response.length > 0) {
        console.log(
          `Found ${response.length} Anywhere Caches for bucket: ${bucketName}`
        );
        for (const anywhereCache of response) {
          console.log(anywhereCache.name);
        }
      } else {
        // Case: Successful but empty list (No Anywhere Caches found)
        console.log(`No Anywhere Caches found for bucket: ${bucketName}.`);
      }
    } catch (error) {
      console.error(
        `Error listing Anywhere Caches for bucket ${bucketName}:`,
        error.message
      );
      throw error;
    }
  }

  callListAnywhereCaches();
  // [END storage_control_list_anywhere_caches]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
