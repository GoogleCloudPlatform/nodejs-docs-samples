// Copyright 2024 Google LLC
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
 * This application demonstrates how to compose/combine multiple files into a
 * single destination file with the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

async function main(
  bucketName = 'my-bucket',
  firstFileName = 'first.txt',
  secondFileName = 'second.txt',
  destinationFileName = 'destination.txt',
  deleteSourceObjects = false
) {
  // [START storage_compose_file]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const bucketName = 'your-unique-bucket-name';
  // const firstFileName = 'first.txt';
  // const secondFileName = 'second.txt';
  // const destinationFileName = 'destination.txt';
  // const deleteSourceObjects = false;

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function composeFile() {
    const bucket = storage.bucket(bucketName);
    const sources = [firstFileName, secondFileName];

    const options = {
      deleteSourceObjects: String(deleteSourceObjects) === 'true',
    };

    await bucket.combine(sources, destinationFileName, options);

    const deletionMessage = options.deleteSourceObjects
      ? ' and the source objects were deleted.'
      : '.';
    console.log(
      `New composite file ${destinationFileName} was created by combining ${sources.join(', ')}${deletionMessage}`
    );
  }

  await composeFile();
  // [END storage_compose_file]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
