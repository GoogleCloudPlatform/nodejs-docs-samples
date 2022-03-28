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
  resourceType
) => {
  // [START healthcare_search_resources_get]
  // Import google-auth-library for authentication.
  const {GoogleAuth} = require('google-auth-library');

  const searchFhirResourcesGet = async () => {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const fhirStoreId = 'my-fhir-store';
    // const resourceType = 'Patient';
    const url = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}`;

    const params = {};
    // Specify search filters in a params object. For example, to filter on a
    // Patient with the last name "Smith", set resourceType to "Patient" and
    // specify the following params:
    // params = {'family:exact' : 'Smith'};
    const client = await auth.getClient();
    const response = await client.request({url, method: 'GET', params});
    const resources = response.data.entry;
    console.log(`Resources found: ${resources.length}`);
    console.log(JSON.stringify(resources, null, 2));
  };

  searchFhirResourcesGet();
  // [END healthcare_search_resources_get]
};

// node searchFhirResourcesGet.js <projectId> <cloudRegion> <datasetId> <fhirStoreId> <resourceType>
main(...process.argv.slice(2));
