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
 * This application demonstrates how to perform basic operations on an Anywhere Cache
 * instance with the Google Cloud Storage API.
 *
 * For more information, see the documentation at https://cloud.google.com/storage/docs/anywhere-cache.
 */

function main(bucketName, cacheName, admissionPolicy) {
  // [START storage_control_update_anywhere_cache]
  /**
   * Updates the Admission Policy of an Anywhere Cache instance.
   *
   * @param {string} bucketName The name of the bucket where the cache resides.
   * Example: 'your-gcp-bucket-name'
   * @param {string} cacheName The unique identifier of the cache instance to update.
   * Example: 'my-anywhere-cache-id'
   * @param {string} admissionPolicy Determines when data is ingested into the cache
   * Example: 'admit-on-second-miss'
   */

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();

  async function callUpdateAnywhereCache() {
    const anywhereCachePath = controlClient.anywhereCachePath(
      '_',
      bucketName,
      cacheName
    );

    // Create the request
    const request = {
      anywhereCache: {
        name: anywhereCachePath,
        admissionPolicy: admissionPolicy,
      },
      updateMask: {
        paths: ['admission_policy'],
      },
    };

    try {
      // Run request
      const [operation] = await controlClient.updateAnywhereCache(request);
      console.log(
        `Waiting for update operation ${operation.name} to complete...`
      );

      const [response] = await operation.promise();

      console.log(`Updated anywhere cache: ${response.name}.`);
    } catch (error) {
      // Handle errors during the initial request or during the LRO polling.
      console.error(
        `Error updating Anywhere Cache '${cacheName}': ${error.message}`
      );

      if (error.code === 5) {
        // NOT_FOUND (gRPC code 5)
        console.error(
          `Ensure the cache '${cacheName}' exists in bucket '${bucketName}'.`
        );
      } else if (error.code === 3) {
        // INVALID_ARGUMENT (gRPC code 3)
        console.error(
          `Ensure '${admissionPolicy}' is a valid Admission Policy.`
        );
      }
      throw error;
    }
  }

  callUpdateAnywhereCache();
  // [END storage_control_update_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
