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
  datasetName = 'YOUR_DATASET_NAME'
) {
  // [START automl_vision_object_detection_create_dataset]
  /**
   * Demonstrates using the AutoML client to create a dataset.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetName = '[DATASET_NAME]' e.g., "myDataset";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();
  const util = require(`util`);

  async function createDataset() {
    // A resource that represents Google Cloud Platform location.
    const projectLocation = automlClient.locationPath(projectId, computeRegion);

    // Set dataset name and metadata.
    const myDataset = {
      displayName: datasetName,
      imageObjectDetectionDatasetMetadata: {},
    };

    // Create a dataset with the dataset metadata in the region.
    const [response] = await automlClient.createDataset({
      parent: projectLocation,
      dataset: myDataset,
    });

    //const dataset = response[0];
    // Display the dataset information.
    console.log(`Dataset name: ${response.name}`);
    console.log(`Dataset Id: ${response.name.split(`/`).pop(-1)}`);
    console.log(`Dataset display name: ${response.displayName}`);
    console.log(`Dataset example count: ${response.exampleCount}`);
    console.log(
      `Image object detection dataset metadata: ${util.inspect(
        response.imageObjectDetectionDatasetMetadata,
        false,
        null
      )}`
    );
  }
  createDataset();
  // [END automl_vision_object_detection_create_dataset]
}
main(...process.argv.slice(2));
