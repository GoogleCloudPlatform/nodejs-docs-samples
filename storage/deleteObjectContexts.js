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
//   title: Delete Object Contexts
//   description: Deletes all custom object contexts from an object.
//   usage: node deleteObjectContexts.js <BUCKET_NAME> <FILE_NAME>

/**
 * This application demonstrates how to delete all custom object contexts from a file
 * in Google Cloud Storage.
 */

function main(bucketName = 'my-bucket', fileName = 'test.txt') {
  // [START storage_delete_object_contexts]
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

  async function deleteObjectContexts() {
    const file = storage.bucket(bucketName).file(fileName);

    // Fetch the current metadata to obtain the object's metageneration.
    const [metadata] = await file.getMetadata();

    // Optional: set a metageneration-match precondition to avoid potential race
    // conditions and data corruptions. The request to update is aborted if the
    // object's metageneration does not match your precondition.
    const options = {
      ifMetagenerationMatch: metadata.metageneration,
    };

    // Object Contexts live in the 'contexts' field, not the 'metadata' field.
    // To delete all custom contexts, set 'custom' to null.
    await file.setMetadata(
      {
        contexts: {
          custom: null,
        },
      },
      options
    );

    console.log(
      `Deleted object contexts for ${fileName} in bucket ${bucketName}.`
    );
  }

  deleteObjectContexts().catch(console.error);
  // [END storage_delete_object_contexts]
}

main(...process.argv.slice(2));
