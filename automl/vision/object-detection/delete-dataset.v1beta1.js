/**
 * Copyright 2019, Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`use strict`;
function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION_NAME',
  datasetId = 'YOUR_DATASET_ID'
) {
  // [START automl_vision_object_detection_delete_dsataset]
  /**
   * Demonstrates using the AutoML client to delete a dataset.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "IOD34216801856389120";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();

  async function deleteDataset() {
    // Get the full path of the dataset.
    const datasetFullId = automlClient.datasetPath(
      projectId,
      computeRegion,
      datasetId
    );

    // Delete a dataset.
    const [operation] = await automlClient.deleteDataset({name: datasetFullId});

    const [response] = await operation.promise();
    const operationDetails = response[2];

    // Get the Dataset delete details.
    console.log('Dataset delete details:');
    console.log(`  Operation details:`);
    console.log(`    Name: ${operationDetails.name}`);
    console.log(`    Done: ${operationDetails.done}`);
  }
  deleteDataset();
  // [END automl_vision_object_detection_delete_dataset]
}
main(...process.argv.slice(2));
