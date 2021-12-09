/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(bucketName, uriPrefix) {
  // [START aiplatform_delete_export_model_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const bucketName = 'YOUR_BUCKET_NAME';
  // const uriPrefix = 'YOUR_GCS_URI_PREFIX'

  // Imports the Google Cloud Storage Client library
  const {Storage} = require('@google-cloud/storage');

  // Instantiates a client
  const storageClient = new Storage();

  async function deleteExportModel() {
    const options = {
      prefix: uriPrefix,
    };
    const [files] = await storageClient
      .bucket(`gs://${bucketName}`)
      .getFiles(options);
    for (const file of files) {
      await storageClient.bucket(`gs://${bucketName}`).file(file.name).delete();
    }
    console.log('Export model deleted');
  }
  deleteExportModel();
  // [END aiplatform_delete_export_model_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
