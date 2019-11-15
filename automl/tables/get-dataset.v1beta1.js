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
  computeRegion = 'YOUR_REGION_NAME',
  datasetId = 'YOUR_DATASET_ID'
) {
  // [START automl_tables_get_dataset]
  const automl = require('@google-cloud/automl');
  const util = require('util');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to get a dataset by ID.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get complete detail of the dataset.
  client
    .getDataset({name: datasetFullId})
    .then(responses => {
      const dataset = responses[0];

      const tablesDatasetMetadata = dataset.tablesDatasetMetadata;

      // Display the dataset information.
      console.log(`Dataset name: ${dataset.name}`);
      console.log(`Dataset Id: ${dataset.name.split(`/`).pop(-1)}`);
      console.log(`Dataset display name: ${dataset.displayName}`);
      console.log(`Dataset example count: ${dataset.exampleCount}`);
      console.log(`Tables dataset metadata:`);
      console.log(
        `\tTarget column correlations: ${util.inspect(
          tablesDatasetMetadata.targetColumnCorrelations,
          false,
          null
        )}`
      );
      console.log(
        `\tPrimary table spec Id: ${tablesDatasetMetadata.primaryTableSpecId}`
      );
      console.log(
        `\tTarget column spec Id: ${tablesDatasetMetadata.targetColumnSpecId}`
      );
      console.log(
        `\tWeight column spec Id: ${tablesDatasetMetadata.weightColumnSpecId}`
      );
      console.log(
        `\tMl use column spec Id: ${tablesDatasetMetadata.mlUseColumnSpecId}`
      );
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_get_dataset]
}
main(...process.argv.slice(2)).catch(console.error());
