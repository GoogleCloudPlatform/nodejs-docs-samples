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
  // [START healthcare_export_fhir_resources_gcs]
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

  const exportFhirResourcesGcs = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const gcsUri = 'my-bucket/my-directory'
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;
    const request = {
      name,
      resource: {
        gcsDestination: {
          // The destination location in Cloud Storage for the FHIR resources
          uriPrefix: `gs://${gcsUri}`,
        },
      },
    };

    const operation =
      await healthcare.projects.locations.datasets.fhirStores.export(request);
    const operationName = operation.data.name;

    // Wait ten seconds for the LRO to finish
    await sleep(10000);

    // Check the LRO's status
    const operationStatus =
      await healthcare.projects.locations.datasets.operations.get({
        name: operationName,
      });

    if (typeof operationStatus.data.metadata.counter !== 'undefined') {
      console.log('Exported FHIR resources successfully');
    } else {
      console.log('Export failed');
    }
  };

  exportFhirResourcesGcs();
  // [END healthcare_export_fhir_resources_gcs]
};

// node exportFhirResources.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <gcsUri>
main(...process.argv.slice(2));
