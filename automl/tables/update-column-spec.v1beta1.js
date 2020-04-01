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
  columnId = 'COLUMN_ID',
  dataTypeCode = 'DATA_TYPE_CODE'
) {
  // [START automl_tables_update_column_spec]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to update a column by ID.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const tableId = '[TABLE_ID]' e.g., "1991013247762825216"`;
  // const columnId = '[COLUMN_ID]' e.g., "773141392279994368";
  // const dataTypeCode = '[DATA_TYPE_CODE]' e.g., "FLOAT64";

  // Get the full path of the column.
  const columnSpecId = client.columnSpecPath(
    projectId,
    computeRegion,
    datasetId,
    tableId,
    columnId
  );

  // Set typecode of column to be changed.
  const typeCode = {typeCode: dataTypeCode.toUpperCase()};

  // Update the name and datatype value of the column spec.
  const columnSpec = {
    name: columnSpecId,
    dataType: typeCode,
  };

  // Add the update mask to particular field.
  const fieldMask = 'dataType';
  const updateMask = {path: fieldMask};

  // Update the column spec.
  client
    .updateColumnSpec({columnSpec: columnSpec, updatemask: updateMask})
    .then(responses => {
      const column = responses[0];

      // Display the column spec information.
      console.log(`Column name: ${column.name}`);
      console.log(`Column Id: ${column.name.split('/').pop(-1)}`);
      console.log(`Column display name: ${column.displayName}`);
      console.log(`Column datatype: ${column.dataType.typeCode}`);
      console.log(
        `Column distinct value count: ${column.dataStats.distinctValueCount}`
      );
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_update_column_spec]
}
main(...process.argv.slice(2)).catch(console.error());
