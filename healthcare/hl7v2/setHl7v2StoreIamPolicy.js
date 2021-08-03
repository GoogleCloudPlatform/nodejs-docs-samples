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
  hl7v2StoreId,
  member,
  role
) => {
  // [START healthcare_hl7v2_store_set_iam_policy]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  const setHl7v2StoreIamPolicy = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const member = 'user:example@gmail.com';
    // const role = 'roles/healthcare.hl7V2StoreViewer';
    const resource_ = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;
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

    const hl7v2Store =
      await healthcare.projects.locations.datasets.hl7V2Stores.setIamPolicy(
        request
      );
    console.log(
      'Set HL7v2 store IAM policy:',
      JSON.stringify(hl7v2Store.data, null, 2)
    );
  };

  setHl7v2StoreIamPolicy();
  // [END healthcare_hl7v2_store_set_iam_policy]
};

// node setHl7v2StoreIamPolicy.js <projectId> <cloudRegion> <datasetId> <hl7v2StoreId> <member> <role>
main(...process.argv.slice(2));
