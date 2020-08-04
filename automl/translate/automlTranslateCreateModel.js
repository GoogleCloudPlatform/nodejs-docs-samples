// Copyright 2020 Google LLC
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

async function main(projectId, computeRegion, datasetId, modelName) {
  // [START automl_translation_create_model]
  const automl = require('@google-cloud/automl');

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;
  // const modelName = `Name of the model, e.g. "myModel"`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  async function createModel() {
    // Set model name and dataset.
    const myModel = {
      displayName: modelName,
      datasetId: datasetId,
      translationModelMetadata: {},
    };

    // Create a model with the model metadata in the region.
    const [, response] = await client.createModel({
      parent: projectLocation,
      model: myModel,
    });

    console.log('Training operation name: ', response.name);
    console.log('Training started...');
  }

  createModel();
  // [END automl_translation_create_model]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
