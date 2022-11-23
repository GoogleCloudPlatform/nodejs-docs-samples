/*
 * Copyright 2022 Google LLC
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

/*
 * Creates a new EntityType with monitoring configuration in a given Featurestore.
 * See https://cloud.google.com/vertex-ai/docs/featurestore/setup before running
 * the code snippet
 */

'use strict';

async function main(
  project,
  featurestoreId,
  entityTypeId,
  description,
  duration = 86400,
  location = 'us-central1',
  apiEndpoint = 'us-central1-aiplatform.googleapis.com',
  timeout = 300000
) {
  // [START aiplatform_create_entity_type_monitoring_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const project = 'YOUR_PROJECT_ID';
  // const featurestoreId = 'YOUR_FEATURESTORE_ID';
  // const entityTypeId = 'YOUR_ENTITY_TYPE_ID';
  // const description = 'YOUR_ENTITY_TYPE_DESCRIPTION';
  // const duration = <MONITORING_INTERVAL_IN_SECONDS>;
  // const location = 'YOUR_PROJECT_LOCATION';
  // const apiEndpoint = 'YOUR_API_ENDPOINT';
  // const timeout = <TIMEOUT_IN_MILLI_SECONDS>;

  // Imports the Google Cloud Featurestore Service Client library
  const {FeaturestoreServiceClient} =
    require('@google-cloud/aiplatform').v1beta1;

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: apiEndpoint,
  };

  // Instantiates a client
  const featurestoreServiceClient = new FeaturestoreServiceClient(
    clientOptions
  );

  async function createEntityTypeMonitoring() {
    // Configure the parent resource
    const parent = `projects/${project}/locations/${location}/featurestores/${featurestoreId}`;

    const entityType = {
      description: description,
      monitoringConfig: {
        snapshotAnalysis: {
          monitoringInterval: {
            seconds: Number(duration),
          },
        },
      },
    };

    const request = {
      parent: parent,
      entityTypeId: entityTypeId,
      entityType: entityType,
    };

    // Create EntityType request
    const [operation] = await featurestoreServiceClient.createEntityType(
      request,
      {timeout: Number(timeout)}
    );
    const [response] = await operation.promise();

    console.log('Create entity type monitoring response');
    console.log(`Name : ${response.name}`);
    console.log('Raw response:');
    console.log(JSON.stringify(response, null, 2));
  }
  createEntityTypeMonitoring();
  // [END aiplatform_create_entity_type_monitoring_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
