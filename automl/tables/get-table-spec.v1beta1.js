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
  tableId = 'TABLE_ID'
) {
  // [START automl_tables_get_table_spec]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to get all table specs
   * information in table.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const tableId = '[TABLE_ID]' e.g., "1991013247762825216";

  // Get the full path of the table.
  const tableSpecId = client.tableSpecPath(
    projectId,
    computeRegion,
    datasetId,
    tableId
  );

  // Get all the information about a given tableSpec of particular dataset.
  client
    .getTableSpec({name: tableSpecId})
    .then(responses => {
      const table = responses[0];

      // Display the table spec information.
      console.log(`Table name: ${table.name}`);
      console.log(`Table Id: ${table.name.split('/').pop(-1)}`);
      console.log(`Table row count: ${table.rowCount}`);
      console.log(`Table column count: ${table.columnCount}`);

      console.log('Table input config:');
      if (table.inputConfigs[0].source === 'gcsSource') {
        console.log(`\t${table.inputConfigs[0].gcsSource.inputUris}`);
      } else {
        console.log(`\t${table.inputConfigs[0].bigquerySource.inputUri}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_get_table_spec]
}
main(...process.argv.slice(2)).catch(console.error());
