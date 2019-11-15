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

async function main(
  projectId = 'YOUR_PROJECT_ID',
  computeRegion = 'YOUR_REGION',
  datasetId = 'YOUR_DATASET',
  modelName = 'YOUR_MODEL'
) {
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

  // Set model name and dataset.
  const myModel = {
    displayName: modelName,
    datasetId: datasetId,
    translationModelMetadata: {},
  };

  // Create a model with the model metadata in the region.
  const [operation, response] = await client.createModel({
    parent: projectLocation,
    model: myModel,
  });
  const initialApiResponse = response;
  console.log(`Training operation name: `, initialApiResponse.name);
  console.log(`Training started...`);
  const [model] = await operation.promise();
  // The final result of the operation.
  console.log(model);
  // Retrieve deployment state.
  let deploymentState = ``;
  if (model.deploymentState === 1) {
    deploymentState = `deployed`;
  } else if (model.deploymentState === 2) {
    deploymentState = `undeployed`;
  }

  // Display the model information.
  console.log(`Model name: ${model.name}`);
  console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
  console.log(`Model display name: ${model.displayName}`);
  console.log(`Model create time:`);
  console.log(`\tseconds: ${model.createTime.seconds}`);
  console.log(`\tnanos: ${model.createTime.nanos}`);
  console.log(`Model deployment state: ${deploymentState}`);

  // [END automl_translation_create_model]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
