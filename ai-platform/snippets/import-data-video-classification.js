/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  datasetId,
  gcsSourceUri,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_import_data_video_classification_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetId = 'YOUR_DATASET_ID';
  // const gcsSourceUri = 'YOUR_GCS_SOURCE_URI';
  // eg. 'gs://<your-gcs-bucket>/<import_source_path>/[file.csv/file.jsonl]'
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Dataset Service Client library
  const {DatasetServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };
  const datasetServiceClient = new DatasetServiceClient(clientOptions);

  async function importDataVideoClassification() {
    const name = datasetServiceClient.datasetPath(project, location, datasetId);
    // Here we use only one import config with one source
    const importConfigs = [
      {
        gcsSource: {uris: [gcsSourceUri]},
        importSchemaUri:
          'gs://google-cloud-aiplatform/schema/dataset/ioformat/video_classification_io_format_1.0.0.yaml',
      },
    ];
    const request = {
      name,
      importConfigs,
    };

    // Create Import Data Request
    const [response] = await datasetServiceClient.importData(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();

    console.log(
      `Import data video classification response : \
        ${JSON.stringify(response.result)}`
    );
  }
  importDataVideoClassification();
  // [END aiplatform_import_data_video_classification_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
