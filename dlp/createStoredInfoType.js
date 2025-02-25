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
// title: Create stored infotype.
// description: Uses the Data Loss Prevention API to create a stored infotype.
// usage: node createStoredInfoType.js projectId  infoTypeId, outputPath, dataProjectId, datasetId, tableId, fieldName
async function main(
  projectId,
  infoTypeId,
  outputPath,
  dataProjectId,
  datasetId,
  tableId,
  fieldName
) {
  // [START dlp_create_stored_infotype]
  // Import the required libraries
  import dlp from '@google-cloud/dlp';

  // Create a DLP client
  const dlpClient = new dlp.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // The identifier for the stored infoType
  // const infoTypeId = 'github-usernames';

  // The path to the location in a Cloud Storage bucket to store the created dictionary
  // const outputPath = 'cloud-bucket-path';

  // The project ID the table is stored under
  // This may or (for public datasets) may not equal the calling project ID
  // const dataProjectId = 'my-project';

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // Field ID to be used for constructing dictionary
  // const fieldName = 'field_name';

  async function createStoredInfoType() {
    // The name you want to give the dictionary.
    const displayName = 'GitHub usernames';
    // A description of the dictionary.
    const description = 'Dictionary of GitHub usernames used in commits';

    // Specify configuration for the large custom dictionary
    const largeCustomDictionaryConfig = {
      outputPath: {
        path: outputPath,
      },
      bigQueryField: {
        table: {
          datasetId: datasetId,
          projectId: dataProjectId,
          tableId: tableId,
        },
        field: {
          name: fieldName,
        },
      },
    };

    // Stored infoType configuration that uses large custom dictionary.
    const storedInfoTypeConfig = {
      displayName: displayName,
      description: description,
      largeCustomDictionary: largeCustomDictionaryConfig,
    };

    // Construct the job creation request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      config: storedInfoTypeConfig,
      storedInfoTypeId: infoTypeId,
    };

    // Send the job creation request and process the response.
    const [response] = await dlpClient.createStoredInfoType(request);

    // Print results
    console.log(`InfoType stored successfully: ${response.name}`);
  }
  await createStoredInfoType();
  // [END dlp_create_stored_infotype]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

export default main;
