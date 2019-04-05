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
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_vision_object_detection_list_datasets]
  /**
   * Demonstrates using the AutoML client to list all Datasets.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const filter_ = '[FILTER_EXPRESSIONS]'
  // e.g., "imageObjectDetectionDatasetMetadata:*";

  //Imports the Google Cloud Automl library
  const {AutoMlClient} = require('@google-cloud/automl').v1beta1;

  // Instantiates a client
  const automlClient = new AutoMlClient();
  const util = require(`util`);

  async function listDatasets() {
    const projectLocation = automlClient.locationPath(projectId, computeRegion);

    // List all the datasets available in the region by applying filter.
    const [response] = await automlClient.listDatasets({
      parent: projectLocation,
      filter: filter,
    });
    console.log('List of datasets:');
    for (const dataset of response) {
      console.log(`\nDataset name: ${dataset.name}`);
      console.log(`Dataset Id: ${dataset.name.split(`/`).pop(-1)}`);
      console.log(`Dataset display name: ${dataset.displayName}`);
      console.log(`Dataset example count: ${dataset.exampleCount}`);
      console.log(
        `Image object detection dataset metadata: ${util.inspect(
          dataset.imageObjectDetectionDatasetMetadata,
          false,
          null
        )}`
      );
    }
  }
  listDatasets();
  // [END automl_vision_object_detection_list_datasets]
}
main(...process.argv.slice(2));
