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
  bundleFile
) {
  // [START healthcare_fhir_execute_bundle]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
    headers: {'Content-Type': 'application/fhir+json'},
  });
  const fs = require('fs');

  async function executeFhirBundle() {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const bundleFile = 'bundle.json';
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

    const bundle = JSON.parse(fs.readFileSync(bundleFile));

    const request = {parent, requestBody: bundle};
    const resource =
      await healthcare.projects.locations.datasets.fhirStores.fhir.executeBundle(
        request
      );
    console.log('FHIR bundle executed');
    console.log(resource.data);
  }

  executeFhirBundle();
  // [END healthcare_fhir_execute_bundle]
}

// node executeFhirBundle.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <bundleFile>
main(...process.argv.slice(2));
