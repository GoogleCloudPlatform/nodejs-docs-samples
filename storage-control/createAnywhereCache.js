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

function main(bucketName, zoneName) {
  // [START storage_control_create_anywhere_cache]

  /**
   * Creates an Anywhere Cache instance for a Cloud Storage bucket.
   * Anywhere Cache is a feature that provides an SSD-backed zonal read cache.
   * This can significantly improve read performance for frequently accessed data
   * by caching it in the same zone as your compute resources.
   *
   * @param {string} bucketName The name of the bucket to create the cache for.
   * Example: 'your-gcp-bucket-name'
   * @param {string} zoneName The zone where the cache will be created.
   * Example: 'us-central1-a'
   */

  // Imports the Control library
  const {StorageControlClient} = require('@google-cloud/storage-control').v2;

  // Instantiates a client
  const controlClient = new StorageControlClient();

  async function callCreateAnywhereCache() {
    const bucketPath = controlClient.bucketPath('_', bucketName);

    // Create the request
    const request = {
      parent: bucketPath,
      anywhereCache: {
        zone: zoneName,
        ttl: {
          seconds: '10000s',
        }, // Optional. Default: '86400s'(1 day)
        admissionPolicy: 'admit-on-first-miss', // Optional. Default: 'admit-on-first-miss'
      },
    };

    try {
      // Run the request, which returns an Operation object
      const [operation] = await controlClient.createAnywhereCache(request);
      console.log(`Waiting for operation ${operation.name} to complete...`);

      // Wait for the operation to complete and get the final resource
      const anywhereCache = await checkCreateAnywhereCacheProgress(
        operation.name
      );
      console.log(`Created anywhere cache: ${anywhereCache.result.name}.`);
    } catch (error) {
      // Handle any error that occurred during the creation or polling process.
      console.error('Failed to create Anywhere Cache:', error.message);
      throw error;
    }
  }

  // A custom function to check the operation's progress.
  async function checkCreateAnywhereCacheProgress(operationName) {
    let operation = {done: false};
    console.log('Starting manual polling for operation...');

    // Poll the operation until it's done.
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 180000)); // Wait for 3 minutes before the next check.
      const request = {
        name: operationName,
      };
      try {
        const [latestOperation] = await controlClient.getOperation(request);
        operation = latestOperation;
      } catch (err) {
        // Handle potential errors during polling.
        console.error('Error while polling:', err.message);
        break; // Exit the loop on error.
      }
    }

    // Return the final result of the operation.
    if (operation.response) {
      // Decode the operation response into a usable Operation object
      const decodeOperation = new controlClient._gaxModule.Operation(
        operation,
        controlClient.descriptors.longrunning.createAnywhereCache,
        controlClient._gaxModule.createDefaultBackoffSettings()
      );
      // Return the decoded operation
      return decodeOperation;
    } else {
      // If there's no response, it indicates an issue, so throw an error
      throw new Error('Operation completed without a response.');
    }
  }

  callCreateAnywhereCache();
  // [END storage_control_create_anywhere_cache]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
