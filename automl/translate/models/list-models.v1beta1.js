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
  filter = 'YOUR_FILTER'
) {
  // [START automl_translation_list_models]
  const automl = require('@google-cloud/automl');

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const filter = `filter expressions, must specify field, e.g. "translationDatasetMetadata:*”`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the models available in the region by applying filter.
  const [models] = await client.listModels({
    parent: projectLocation,
    filter: filter,
  });

  // Display the model information.
  console.log(`List of models:`);
  models.forEach(model => {
    console.log(`Model name: ${model.name}`);
    console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
    console.log(`Model display name: ${model.displayName}`);
    console.log(`Model dataset id: ${model.datasetId}`);
    console.log(`Model create time:`);
    console.log(`\tseconds: ${model.createTime.seconds}`);
    console.log(`\tnanos: ${model.createTime.nanos}`);
    console.log(`Model update time:`);
    console.log(`\tseconds: ${model.updateTime.seconds}`);
    console.log(`\tnanos: ${model.updateTime.nanos}`);
    console.log(`Model deployment state: ${model.deploymentState}`);
    console.log(`\n`);
  });

  // [END automl_translation_list_models]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
