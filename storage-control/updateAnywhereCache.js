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

    // Run request
    const [operation] = await controlClient.updateAnywhereCache(request);
    const [response] = await operation.promise();

    console.log(`Updated anywhere cache: ${response.name}.`);
  }

  callUpdateAnywhereCache();
  // [END storage_control_update_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
