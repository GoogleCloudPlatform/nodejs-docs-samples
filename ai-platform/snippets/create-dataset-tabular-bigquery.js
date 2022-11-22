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
  datasetDisplayName,
  bigquerySourceUri,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_create_dataset_tabular_bigquery_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const datasetDisplayName = 'YOUR_DATASET_DISPLAY_NAME';
  // const bigquerySourceUri = 'YOUR_BIGQUERY_SOURCE_URI';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Dataset Service Client library
  const {DatasetServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const datasetServiceClient = new DatasetServiceClient(clientOptions);

  async function createDatasetTabularBigquery() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}`;
    const metadata = {
      structValue: {
        fields: {
          inputConfig: {
            structValue: {
              fields: {
                bigquerySource: {
                  structValue: {
                    fields: {
                      uri: {
                        listValue: {
                          values: [{stringValue: bigquerySourceUri}],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    // Configure the dataset resource
    const dataset = {
      displayName: datasetDisplayName,
      metadataSchemaUri:
        'gs://google-cloud-aiplatform/schema/dataset/metadata/tabular_1.0.0.yaml',
      metadata: metadata,
    };
    const request = {
      parent,
      dataset,
    };

    // Create dataset request
    const [response] = await datasetServiceClient.createDataset(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    const result = response.result;

    console.log('Create dataset tabular bigquery response');
    console.log(`\tName : ${result.name}`);
    console.log(`\tDisplay name : ${result.displayName}`);
    console.log(`\tMetadata schema uri : ${result.metadataSchemaUri}`);
    console.log(`\tMetadata : ${JSON.stringify(result.metadata)}`);
  }
  createDatasetTabularBigquery();
  // [END aiplatform_create_dataset_tabular_bigquery_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
