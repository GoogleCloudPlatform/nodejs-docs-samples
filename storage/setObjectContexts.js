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
//   title: Set Object Contexts
//   description: Sets custom metadata (contexts) on an object.
//   usage: node setObjectContexts.js <BUCKET_NAME> <FILE_NAME>

/**
 * This application demonstrates how to set, update, and delete object contexts (metadata) on a file
 * in Google Cloud Storage.
 */

function main(bucketName = 'my-bucket', fileName = 'test.txt') {
  // [START storage_set_object_contexts]
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

  async function setObjectContexts() {
    const file = storage.bucket(bucketName).file(fileName);
    try {
      // Create/Update Object Contexts
      // Object Contexts live in the 'contexts' field, not the 'metadata' field.
      const [metadata] = await file.setMetadata({
        contexts: {
          custom: {
            'team-owner': {value: 'storage-team'},
            priority: {value: 'high'},
          },
        },
      });

      console.log(`Updated Object Contexts for ${fileName}:`);
      console.log(JSON.stringify(metadata.contexts, null, 2));
    } catch (error) {
      console.error(
        'Error executing set object contexts:',
        error.message || error
      );
    }
    // Delete a specific key from the context:
    // We send 'null' for the specific key we want to remove.
    await file.setMetadata({
      contexts: {
        custom: {
          'team-owner': null,
        },
      },
    });
    console.log(`Deleted 'team-owner' key from contexts for ${fileName}.`);

    // Delete all keys from the context:
    // We set the 'custom' property to null to wipe the entire map.
    await file.setMetadata({
      contexts: {
        custom: null,
      },
    });
    console.log(`Cleared all custom contexts for ${fileName}.`);
  }

  setObjectContexts().catch(console.error);
  // [END storage_set_object_contexts]
}

main(...process.argv.slice(2));
