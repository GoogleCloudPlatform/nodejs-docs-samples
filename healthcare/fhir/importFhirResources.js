/**
 * Copyright 2019, Google, LLC
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-warning-comments */

'use strict';

function main(
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  fhirStoreId,
  gcsUri
) {
  // [START healthcare_import_fhir_resources]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1beta1');
  const sleep = require('../sleep');

  async function importFhirResources() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

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
        contentStructure: 'BUNDLE',
        gcsSource: {
          uri: `gs://${gcsUri}`,
        },
      },
    };

    const operation = await healthcare.projects.locations.datasets.fhirStores.import(
      request
    );
    const operationName = operation.data.name;

    const operationRequest = {name: operationName};

    // Wait five seconds for the LRO to finish.
    await sleep(5000);

    // Check the LRO's status
    const operationStatus = await healthcare.projects.locations.datasets.operations.get(
      operationRequest
    );

    if (typeof operationStatus.data.error === 'undefined') {
      console.log(
        `Import FHIR resources succeeded. ${operationStatus.data.response.inputSize} resources imported`
      );
    } else {
      console.log(
        'Imported FHIR resources failed. Details\n:',
        operationStatus.data.error
      );
    }
  }

  importFhirResources();
  // [END healthcare_import_fhir_resources]
}

// node importFhirResources.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <gcsUri>
main(...process.argv.slice(2));
