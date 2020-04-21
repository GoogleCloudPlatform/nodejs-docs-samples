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
  member,
  role
) => {
  // [START healthcare_fhir_store_set_iam_policy]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');

  const setFhirStoreIamPolicy = async () => {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const member = 'user:example@gmail.com';
    // const role = 'roles/healthcare.fhirStoreViewer';
    const resource_ = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;
    const request = {
      resource_,
      resource: {
        policy: {
          bindings: [
            {
              members: member,
              role: role,
            },
          ],
        },
      },
    };

    const fhirStore = await healthcare.projects.locations.datasets.fhirStores.setIamPolicy(
      request
    );
    console.log(
      'Set FHIR store IAM policy:',
      JSON.stringify(fhirStore.data, null, 2)
    );
  };

  setFhirStoreIamPolicy();
  // [END healthcare_fhir_store_set_iam_policy]
};

// node setFhirStoreIamPolicy.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <member> <role>
main(...process.argv.slice(2));
