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
  hl7v2StoreId
) => {
  // [START healthcare_get_hl7v2_store]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  const getHl7v2Store = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const hl7v2StoreId = 'my-hl7v2-store';
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;
    const request = {name};

    const hl7v2Store =
      await healthcare.projects.locations.datasets.hl7V2Stores.get(request);
    console.log(hl7v2Store.data);
  };

  getHl7v2Store();
  // [END healthcare_get_hl7v2_store]
};

// node getHl7v2Store.js <projectId> <cloudRegion> <datasetId> <hl7v2StoreId>
main(...process.argv.slice(2));
