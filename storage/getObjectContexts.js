// Copyright 2026 Google LLC
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

// sample-metadata:
//   title: Get Object Contexts
//   description: Retrieves the structured Object Contexts from an object.
//   usage: node getObjectContexts.js <BUCKET_NAME> <FILE_NAME>

/**
 * This application demonstrates how to retrieve the 'contexts' field from a file
 * in Google Cloud Storage.
 */

function main(bucketName = 'my-bucket', fileName = 'test.txt') {
  // [START storage_get_object_contexts]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The ID of your GCS file
  // const fileName = 'your-file-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function getObjectContexts() {
    // Gets the metadata for the file
    const [metadata] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getMetadata();

    // Contexts are stored in metadata.contexts.custom
    if (metadata.contexts && metadata.contexts.custom) {
      console.log(`Object Contexts for ${fileName}:`);

      // Iterate through the custom contexts to show values and timestamps
      for (const [key, details] of Object.entries(metadata.contexts.custom)) {
        console.log(`- Key: ${key}`);
        console.log(`  Value: ${details.value}`);
        console.log(`  Created: ${details.createTime}`);
        console.log(`  Updated: ${details.updateTime}`);
      }
    } else {
      console.log(`No Object Contexts found for ${fileName}.`);
    }
  }

  getObjectContexts().catch(console.error);
  // [END storage_get_object_contexts]
}

main(...process.argv.slice(2));
