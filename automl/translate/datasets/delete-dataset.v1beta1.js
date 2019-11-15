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
  datasetId = 'YOUR_DATASET'
) {
  // [START automl_translation_delete_dataset]
  const automl = require('@google-cloud/automl');
  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Delete a dataset.
  const [operations] = await client.deleteDataset({name: datasetFullId});
  const operationResponses = await operations.promise();
  // The final result of the operation.
  if (operationResponses[2].done === true) console.log(`Dataset deleted.`);

  // [END automl_translation_delete_dataset]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
