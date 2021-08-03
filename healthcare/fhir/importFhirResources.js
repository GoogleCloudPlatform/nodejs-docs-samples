// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const main = (
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  fhirStoreId,
  gcsUri
) => {
  // [START healthcare_import_fhir_resources]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });
  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const importFhirResources = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const gcsUri = 'my-bucket/my-directory/*.json'
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;
    const request = {
      name,
      resource: {
        contentStructure: 'RESOURCE',
        gcsSource: {
          uri: `gs://${gcsUri}`,
        },
      },
    };

    const operation =
      await healthcare.projects.locations.datasets.fhirStores.import(request);
    const operationName = operation.data.name;

    const operationRequest = {name: operationName};

    // Wait twenty seconds for the LRO to finish.
    await sleep(20000);

    // Check the LRO's status
    const operationStatus =
      await healthcare.projects.locations.datasets.operations.get(
        operationRequest
      );

    const success = operationStatus.data.metadata.counter.success;

    if (typeof success !== 'undefined') {
      console.log(
        `Import FHIR resources succeeded. ${success} resources imported.`
      );
    } else {
      console.log(
        'Imported FHIR resources failed. Details available in Cloud Logging at the following URL:\n',
        operationStatus.data.metadata.logsUrl
      );
    }
  };

  importFhirResources();
  // [END healthcare_import_fhir_resources]
};

// node importFhirResources.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <gcsUri>
main(...process.argv.slice(2));
