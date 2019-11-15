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
  path = 'YOUR_PATH'
) {
  // [START automl_translation_import_data]
  const automl = require('@google-cloud/automl');

  const client = new automl.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;
  // const path = `string or array of .csv paths in AutoML Vision CSV format, e.g. “gs://myproject/mytraindata.csv”;`

  // Get the full path of the dataset.
  const datasetFullId = client.datasetPath(projectId, computeRegion, datasetId);

  // Get the multiple Google Cloud Storage URIs.
  const inputUris = path.split(`,`);
  const inputConfig = {
    gcsSource: {
      inputUris: inputUris,
    },
  };

  // Import data from the input URI.
  const [operation] = await client.importData({
    name: datasetFullId,
    inputConfig: inputConfig,
  });
  console.log(`Processing import...`);
  const operationResponses = await operation.promise();
  // The final result of the operation.
  if (operationResponses[2].done === true) {
    console.log(`Data imported.`);
  }

  // [END automl_translation_import_data]
}

main(...process.argv.slice(2)).catch(err => console.error(err));
