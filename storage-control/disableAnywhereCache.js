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
  // [START storage_control_disable_anywhere_cache]
  /**
   * Disables an Anywhere Cache instance.
   *
   * Disabling a cache is the first step to permanently removing it. Once disabled,
   * the cache stops ingesting new data. After a grace period, the cache and its
   * contents are deleted. This is useful for decommissioning caches that are no
   * longer needed.
   *
   * @param {string} bucketName The name of the bucket where the cache resides.
   * Example: 'your-gcp-bucket-name'
   * @param {string} cacheName The unique identifier of the cache instance to disable.
   * Example: 'cacheName'
   */

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();

  async function callDisableAnywhereCache() {
    // You have a one-hour grace period after disabling a cache to resume it and prevent its deletion.
    // If you don't resume the cache within that hour, it will be deleted, its data will be evicted,
    // and the cache will be permanently removed from the bucket.

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
      // Run request. This initiates the disablement process.
      const [response] = await controlClient.disableAnywhereCache(request);

      console.log(
        `Successfully initiated disablement for Anywhere Cache '${cacheName}'.`
      );
      console.log(`  Current State: ${response.state}`);
      console.log(`  Resource Name: ${response.name}`);
    } catch (error) {
      // Catch and handle potential API errors.
      console.error(
        `Error disabling Anywhere Cache '${cacheName}': ${error.message}`
      );

      if (error.code === 5) {
        // NOT_FOUND (gRPC code 5) error can occur if the bucket or cache does not exist.
        console.error(
          `Please ensure the cache '${cacheName}' exists in bucket '${bucketName}'.`
        );
      } else if (error.code === 9) {
        // FAILED_PRECONDITION (gRPC code 9) can occur if the cache is already being disabled
        // or is not in a RUNNING state that allows the disable operation.
        console.error(
          `Cache '${cacheName}' may not be in a state that allows disabling (e.g., must be RUNNING).`
        );
      }
      throw error;
    }
    // Run request
    const [response] = await controlClient.disableAnywhereCache(request);
    console.log(`Disabled anywhere cache: ${response.name}.`);
  }

  callDisableAnywhereCache();
  // [END storage_control_disable_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
