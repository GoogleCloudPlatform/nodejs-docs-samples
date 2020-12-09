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
  resourceType,
  resourceId
) {
  // [START healthcare_patch_fhir_resource]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');

  async function patchFhirResource() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    // TODO(developer): replace patchOptions with your desired JSON patch body
    const patchOptions = [{op: 'replace', path: '/active', value: false}];
    google.options({
      auth,
      headers: {'Content-Type': 'application/json-patch+json'},
    });

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const resourceType = 'Patient';
    // const resourceId = '16e8a860-33b3-49be-9b03-de979feed14a';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}/${resourceId}`;
    const request = {
      name,
      requestBody: patchOptions,
    };

    await healthcare.projects.locations.datasets.fhirStores.fhir.patch(request);
    console.log(`Patched ${resourceType} resource`);
  }

  patchFhirResource();
  // [END healthcare_patch_fhir_resource]
}

// node patchFhirResource.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <resourceType> <resourceId>
main(...process.argv.slice(2));
