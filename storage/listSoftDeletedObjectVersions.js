/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function main(bucketName = 'my-bucket', fileName = 'test.txt') {
  // [START storage_list_soft_deleted_object_versions]
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

  async function listSoftDeletedObjectVersions() {
    const options = {
      softDeleted: true,
      matchGlob: fileName,
    };

    const [files] = await storage.bucket(bucketName).getFiles(options);

    console.log('Files:');
    files.forEach(file => {
      console.log(
        `Name: ${file.name}, Generation: ${file.metadata.generation}`
      );
    });
  }

  listSoftDeletedObjectVersions().catch(console.error);
  // [END storage_list_soft_deleted_object_versions]
}

main(...process.argv.slice(2));
