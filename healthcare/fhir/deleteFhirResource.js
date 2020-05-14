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

/* eslint-disable no-warning-comments */

'use strict';

const main = (
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) => {
  // [START healthcare_delete_resource]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');

  const deleteFhirResource = async () => {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const resourceType = 'Patient';
    // const resourceId = '9a664e07-79a4-4c2e-04ed-e996c75484e1;
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}/${resourceId}`;
    const request = {name};

    await healthcare.projects.locations.datasets.fhirStores.fhir.delete(
      request
    );
    console.log(`Deleted FHIR resource ${resourceType}`);
  };

  deleteFhirResource();
  // [END healthcare_delete_resource]
};

// node deleteFhirResource.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <resourceType> <resourceId>
main(...process.argv.slice(2));
