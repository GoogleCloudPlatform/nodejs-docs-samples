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
  tableId = 'TABLE_ID',
  filter = 'FILTER_EXPRESSION'
) {
  // [START automl_tables_list_column_specs]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to list all column specs in
   * table columns.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const tableId = '[TABLE_ID]' e.g., "1991013247762825216"`;
  // const filter = '[FILTER_EXPRESSIONS]' e.g., "tablesDatasetMetadata:*";

  // Get the full path of the table.
  const tableSpecId = client.tableSpecPath(
    projectId,
    computeRegion,
    datasetId,
    tableId
  );

  // List all the column specs of particular table available in the region by
  // applying filter.
  client
    .listColumnSpecs({parent: tableSpecId, filter: filter})
    .then(responses => {
      const column = responses[0];

      // Display the table columns specs information.
      console.log('List of column specs: ');
      for (let i = 0; i < column.length; i++) {
        console.log(`Column name: ${column[i].name}`);
        console.log(`Column Id: ${column[i].name.split('/').pop(-1)}`);
        console.log(`Column display name: ${column[i].displayName}`);
        console.log(`Column datatype: ${column[i].dataType.typeCode}`);
        console.log(
          `Column distinct value count: ${column[i].dataStats.distinctValueCount}`
        );
        console.log('\n');
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_list_column_specs]
}
main(...process.argv.slice(2)).catch(console.error());
