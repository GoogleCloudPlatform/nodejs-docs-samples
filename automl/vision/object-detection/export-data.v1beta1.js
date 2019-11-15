// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  datasetId = 'YOUR_DATASET_ID',
  gcsOutputUri = 'GCS_DIRECTORY'
) {
  // [START automl_vision_object_detection_export_data]
  /**
   * Demonstrates using the AutoML client to export a dataset to a
   * Google Cloud Storage bucket.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g.,"IOD34216801856389120";
  // const gcsOutputUri = '[GCS_OUTPUT_URI]' e.g., "gs://<bucket-name>/<folder-name>",
  // `Google Cloud Storage URI for the export directory`;

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();

  async function exportData() {
    // Get the full path of the dataset.
    const datasetFullId = automlClient.datasetPath(
      projectId,
      computeRegion,
      datasetId
    );

    // Set the output URI
    const outputConfig = {
      gcsDestination: {
        outputUriPrefix: gcsOutputUri,
      },
    };

    // Set the request
    const request = {
      name: datasetFullId,
      outputConfig: outputConfig,
    };

    // Export the data to the output URI.
    const [operation] = await automlClient.exportData(request);

    const [response] = await operation.promise();
    console.log('Data export details:');
    console.log(` Operation details:`);
    console.log(`   Name: ${response.name}`);
    console.log(`  Done: ${response.done}`);
  }
  exportData();
  // [END automl_vision_object_detection_export_data]
}
main(...process.argv.slice(2));
