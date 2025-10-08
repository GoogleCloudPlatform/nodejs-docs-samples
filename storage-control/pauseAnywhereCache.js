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
  // [START storage_control_pause_anywhere_cache]
  /**
   * Pauses an Anywhere Cache instance.
   *
   * This synchronous function stops the ingestion of new data for a cache that's in a RUNNING state.
   * While PAUSED, you can still read existing data (which resets the TTL), but no new data is ingested.
   * The cache can be returned to the RUNNING state by calling the resume function.
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

  async function callPauseAnywhereCache() {
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
      const [response] = await controlClient.pauseAnywhereCache(request);

      console.log(`Successfully paused anywhere cache: ${response.name}.`);
      console.log(`  Current State: ${response.state}`);
    } catch (error) {
      // Catch and handle potential API errors.
      console.error(
        `Error pausing Anywhere Cache '${cacheName}': ${error.message}`
      );

      if (error.code === 5) {
        // NOT_FOUND (gRPC code 5)
        console.error(
          `Please ensure the cache '${cacheName}' exists in bucket '${bucketName}'.`
        );
      } else if (error.code === 9) {
        // FAILED_PRECONDITION (gRPC code 9)
        console.error(
          `Cache '${cacheName}' may not be in a state that allows pausing (e.g., must be RUNNING).`
        );
      }
      throw error;
    }
  }

  callPauseAnywhereCache();
  // [END storage_control_pause_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
