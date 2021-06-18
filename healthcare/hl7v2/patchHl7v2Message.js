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
  hl7v2MessageId,
  labelKey,
  labelValue
) => {
  // [START healthcare_patch_hl7v2_message]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  const patchHl7v2Message = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const hl7v2StoreId = 'my-hl7v2-store';
    // const hl7v2MessageId = 'qCnewKno44gTt3oBn4dQ0u8ZA23ibDdV9GpifD2E=';
    // const labelKey = 'status';
    // const labelValue = 'processed';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}/messages/${hl7v2MessageId}`;
    const request = {
      name,
      updateMask: 'labels',
      resource: {
        labels: {
          labelKey: labelValue,
        },
      },
    };

    await healthcare.projects.locations.datasets.hl7V2Stores.messages.patch(
      request
    );
    console.log('Patched HL7v2 message');
  };

  patchHl7v2Message();
  // [END healthcare_patch_hl7v2_message]
};

// node patchHl7v2Message.js <projectId> <cloudRegion> <datasetId> <hl7v2StoreId> <hl7v2MessageId> <labelKey> <labelValue>
main(...process.argv.slice(2));
