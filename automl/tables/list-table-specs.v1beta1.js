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
  datasetId = 'YOUR_DATASET_ID',
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_tables_list_table_specs]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to list all table specs in datasets.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const filter = '[FILTER_EXPRESSIONS]' e.g., "tablesDatasetMetadata:*";

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // List all the table specs in datasets available in the region
  // by applying filter.
  client
    .listTableSpecs({parent: datasetFullId, filter: filter})
    .then(responses => {
      const table = responses[0];

      // Display the table information.
      console.log(`List of table specs: `);
      for (let i = 0; i < table.length; i++) {
        console.log(`Table name: ${table[i].name}`);
        console.log(`Table Id: ${table[i].name.split(`/`).pop(-1)}`);
        console.log(`Table row count: ${table[i].rowCount}`);
        console.log(`Table column count: ${table[i].columnCount}`);

        console.log(`Table input config:`);
        if (table[i].inputConfigs[0].source === `gcsSource`) {
          console.log(`\t${table[i].inputConfigs[0].gcsSource.inputUris}`);
        } else {
          console.log(`\t${table[i].inputConfigs[0].bigquerySource.inputUri}`);
        }
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_list_table_specs]
}
main(...process.argv.slice(2)).catch(console.error());
