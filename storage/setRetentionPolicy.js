// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * This application demonstrates how to use Bucket Lock operations on buckets
 * and objects using the Google Cloud Storage API.
 *
 * For more information read the documentation
 * at https://cloud.google.com/storage/docs/bucket-lock
 */

function main(bucketName = 'my-bucket', retentionPeriod = 5) {
  // [START storage_set_retention_policy]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The retention period for objects in bucket
  // const retentionPeriod = 3600; // 1 hour in seconds

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function setRetentionPolicy() {
    try {
      const [metadata] = await storage
        .bucket(bucketName)
        .setRetentionPeriod(retentionPeriod);
      console.log(
        `Bucket ${bucketName} retention period set for ${metadata.retentionPolicy.retentionPeriod} seconds.`
      );
    } catch (error) {
      console.error(
        'Error executing set bucket retention policy:',
        error.message || error
      );
    }
  }

  setRetentionPolicy();
  // [END storage_set_retention_policy]
}
main(...process.argv.slice(2));
