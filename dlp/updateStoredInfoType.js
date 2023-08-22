// Copyright 2023 Google LLC
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
//  title: Update stored infoType.
//  description: Uses the Data Loss Prevention API to update a stored infoType.
//  usage: node updateStoredInfoType.js projectId  infoTypeId, outputPath, fileSetUrl
async function main(projectId, infoTypeId, outputPath, fileSetUrl) {
  // [START dlp_update_stored_infotype]
  // Import the required libraries
  const dlp = require('@google-cloud/dlp');

  // Create a DLP client
  const dlpClient = new dlp.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // The identifier for the stored infoType
  // const infoTypeId = 'github-usernames';

  // The path to the location in a Cloud Storage bucket to store the created dictionary
  // const outputPath = 'cloud-bucket-path';

  // Path of file containing term list
  // const cloudStorageFileSet = 'gs://[PATH_TO_GS]';

  async function updateStoredInfoType() {
    // Specify configuration of the large custom dictionary including cloudStorageFileSet and outputPath
    const largeCustomDictionaryConfig = {
      outputPath: {
        path: outputPath,
      },
      cloudStorageFileSet: {
        url: fileSetUrl,
      },
    };

    // Construct the job creation request to be sent by the client.
    const updateStoredInfoTypeRequest = {
      name: `projects/${projectId}/storedInfoTypes/${infoTypeId}`,
      config: {
        largeCustomDictionary: largeCustomDictionaryConfig,
      },
      updateMask: {
        paths: ['large_custom_dictionary.cloud_storage_file_set.url'],
      },
    };

    // Send the job creation request and process the response.
    const [response] = await dlpClient.updateStoredInfoType(
      updateStoredInfoTypeRequest
    );

    // Print the results.
    console.log(`InfoType updated successfully: ${JSON.stringify(response)}`);
  }
  await updateStoredInfoType();
  // [END dlp_update_stored_infotype]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

module.exports = main;
