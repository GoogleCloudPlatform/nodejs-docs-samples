// Copyright 2020 Google LLC
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

async function main(projectId, displayName) {
  // [START automl_translation_create_dataset]

  /**
   * Demonstrates using the AutoML client to request to create dataset for
   * automl translation.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const displayName = '[DATASET_DISPLAY_NAME]' e.g., "my-dataset-name";

  const automl = require('@google-cloud/automl');

  // Create client for automl service.
  const client = new automl.AutoMlClient();
  const computeRegion = 'us-central1';
  const source = 'en';
  const target = 'ja';

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  async function createDataset() {
    // Specify the source and target language.
    const datasetSpec = {
      sourceLanguageCode: source,
      targetLanguageCode: target,
    };

    // Set dataset name and dataset specification.
    const datasetInfo = {
      displayName: displayName,
      translationDatasetMetadata: datasetSpec,
    };

    // Create a dataset with the dataset specification in the region.
    const [operation] = await client.createDataset({
      parent: projectLocation,
      dataset: datasetInfo,
    });

    // wait for lro to finish
    const [dataset] = await operation.promise();
    // Display the dataset information
    console.log(`Dataset name: ${dataset.name}`);
    console.log(`Dataset id: ${dataset.name.split('/').pop(-1)}`);
  }

  createDataset();
  // [END automl_translation_create_dataset]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
