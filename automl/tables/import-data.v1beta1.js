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
  path = 'GCS_PATH or BIGQUERY_PATH'
) {
  // [START automl_tables_import_data]
  const automl = require('@google-cloud/automl');
  const client = new automl.v1beta1.AutoMlClient();

  /**
   * Demonstrates using the AutoML client to import data.
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = '[PROJECT_ID]' e.g., "my-gcloud-project";
  // const computeRegion = '[REGION_NAME]' e.g., "us-central1";
  // const datasetId = '[DATASET_ID]' e.g., "TBL2246891593778855936";
  // const path = '[GCS_PATH]' | '[BIGQUERY_PATH]'
  // e.g., "gs://<bucket-name>/<csv file>" or
  // "bq://<project_id>.<dataset_id>.<table_id>",
  // `string or array of paths in AutoML Tables format`;

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  let inputConfig = {};
  if (path.startsWith('bq')) {
    // Get Bigquery URI.
    inputConfig = {
      bigquerySource: {
        inputUri: path,
      },
    };
  } else {
    // Get the multiple Google Cloud Storage URIs.
    const inputUris = path.split(',');
    inputConfig = {
      gcsSource: {
        inputUris: inputUris,
      },
    };
  }

  // Import the dataset from the input URI.
  client
    .importData({name: datasetFullId, inputConfig: inputConfig})
    .then(responses => {
      const operation = responses[0];
      console.log('Processing import...');
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      const operationDetails = responses[2];

      // Get the data import details.
      console.log('Data import details:');
      console.log('\tOperation details:');
      console.log(`\t\tName: ${operationDetails.name}`);
      console.log(`\t\tDone: ${operationDetails.done}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_tables_import_data]
}
main(...process.argv.slice(2)).catch(console.error());
