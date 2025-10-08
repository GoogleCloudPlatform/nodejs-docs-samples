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

function main(bucketName, cacheName) {
  // [START storage_control_get_anywhere_cache]
  /**
   * Retrieves details of a specific Anywhere Cache instance.
   *
   * This function is useful for checking the current state, configuration (like TTL),
   * and other metadata of an existing cache.
   *
   * @param {string} bucketName The name of the bucket where the cache resides.
   * Example: 'your-gcp-bucket-name'
   * @param {string} cacheName The unique identifier of the cache instance.
   * Example: 'my-anywhere-cache-id'
   */

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();

  async function callGetAnywhereCache() {
    const anywhereCachePath = controlClient.anywhereCachePath(
      '_',
      bucketName,
      cacheName
    );

    // Create the request
    const request = {
      name: anywhereCachePath,
    };

    try {
      // Run request
      const [response] = await controlClient.getAnywhereCache(request);
      console.log(`Anywhere Cache details for '${cacheName}':`);
      console.log(`  Name: ${response.name}`);
      console.log(`  Zone: ${response.zone}`);
      console.log(`  State: ${response.state}`);
      console.log(`  TTL: ${response.ttl.seconds}s`);
      console.log(`  Admission Policy: ${response.admissionPolicy}`);
      console.log(
        `  Create Time: ${new Date(response.createTime.seconds * 1000).toISOString()}`
      );
    } catch (error) {
      // Handle errors (e.g., cache not found, permission denied).
      console.error(
        `Error retrieving Anywhere Cache '${cacheName}': ${error.message}`
      );

      if (error.code === 5) {
        console.error(
          `Ensure the cache '${cacheName}' exists in bucket '${bucketName}'.`
        );
      }
      throw error;
    }
  }

  callGetAnywhereCache();
  // [END storage_control_get_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
