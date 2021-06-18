/**
 * Copyright 2020, Google, LLC
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

'use strict';

function main(
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  fhirStoreId,
  resourceType
) {
  // [START healthcare_create_resource]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
    headers: {'Content-Type': 'application/fhir+json'},
  });

  async function createFhirResource() {
    // Replace the following body with the data for the resource you want to
    // create.
    const body = {
      name: [{use: 'official', family: 'Smith', given: ['Darcy']}],
      gender: 'female',
      birthDate: '1970-01-01',
      resourceType: 'Patient',
    };

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const resourceType = 'Patient';
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

    const request = {parent, type: resourceType, requestBody: body};
    const resource =
      await healthcare.projects.locations.datasets.fhirStores.fhir.create(
        request
      );
    console.log(`Created FHIR resource with ID ${resource.data.id}`);
    console.log(resource.data);
  }

  createFhirResource();
  // [END healthcare_create_resource]
}

// node createFhirResource.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <resourceType>
main(...process.argv.slice(2));
