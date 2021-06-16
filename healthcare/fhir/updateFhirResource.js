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
  resourceType,
  resourceId
) => {
  // [START healthcare_update_resource]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
    headers: {'Content-Type': 'application/fhir+json'},
  });

  const updateFhirResource = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const resourceType = 'Patient';
    // const resourceId = '16e8a860-33b3-49be-9b03-de979feed14a';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}/${resourceId}`;
    // The following body works with a Patient resource and is not intended
    // to work with other types of FHIR resources. If necessary, supply a new
    // body with data that corresponds to the FHIR resource you are updating.
    const body = {resourceType: resourceType, id: resourceId, active: true};
    const request = {name, requestBody: body};

    const resource =
      await healthcare.projects.locations.datasets.fhirStores.fhir.update(
        request
      );
    console.log(`Updated ${resourceType} resource:\n`, resource.data);
  };

  updateFhirResource();
  // [END healthcare_update_resource]
};

// node updateFhirResource.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <resourceType> <resourceId>
main(...process.argv.slice(2));
