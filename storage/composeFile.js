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

function main(
  bucketName = 'my-bucket',
  firstFileName = 'first.txt',
  secondFileName = 'second.txt',
  destinationFileName = 'composite.txt',
  deleteSourceObjects = false
) {
  // [START storage_compose_file]

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The ID of the first file to compose
  // const firstFileName = 'first.txt';

  // The ID of the second file to compose
  // const secondFileName = 'second.txt';

  // The ID of the destination file
  // const destinationFileName = 'composite.txt';

  // Whether to delete the source objects after composing
  // const deleteSourceObjects = false;

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function composeFile() {
    // If deleteSourceObjects is passed as a string from command line, parse it
    const shouldDelete = String(deleteSourceObjects) === 'true';

    try {
      const bucket = storage.bucket(bucketName);
      const sources = [firstFileName, secondFileName];

      await bucket.combine(sources, destinationFileName, {
        deleteSourceObjects: shouldDelete,
      });

      const deletionMessage = shouldDelete
        ? ' and deleting source files.'
        : '.';
      console.log(
        `New composite file ${destinationFileName} was created in bucket ${bucketName} by combining ${firstFileName} and ${secondFileName}${deletionMessage}`
      );
    } catch (error) {
      if (error.name === 'ComposeCleanupError') {
        console.error(
          `Compose succeeded, but source deletion failed: ${error.message}`
        );
        if (error.errors && error.errors.length > 0) {
          for (const err of error.errors) {
            console.error(`- Deletion error: ${err.message || err}`);
          }
        }
      } else {
        console.error('Error executing compose file:', error.message || error);
      }
    }
  }

  composeFile();
  // [END storage_compose_file]
}

main(...process.argv.slice(2));
