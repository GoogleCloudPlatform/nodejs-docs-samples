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
 * This application demonstrates how to perform basic operations on buckets with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

function main(projectId, bucketName = 'my-bucket') {
  // [START storage_get_requester_pays_status]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your Google Cloud project
  // const projectId = 'your-project-id';

  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function getRequesterPaysStatus() {
    try {
      // Gets the requester-pays status of a bucket
      const [metadata] = await storage
        .bucket(bucketName)
        .getMetadata({userProject: projectId});

      let status;
      if (metadata && metadata.billing && metadata.billing.requesterPays) {
        status = 'enabled';
      } else {
        status = 'disabled';
      }
      console.log(
        `Requester-pays requests are ${status} for bucket ${bucketName}.`
      );
    } catch (error) {
      console.error(
        'Error executing get requester pays status:',
        error.message || error
      );
    }
  }

  getRequesterPaysStatus();
  // [END storage_get_requester_pays_status]
}
main(...process.argv.slice(2));
