/**
 * Copyright 2019, Google, LLC
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
  projectId = process.env.GCLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId
) {
  // [START healthcare_create_dataset]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1alpha2');

  async function createDataset() {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({auth});

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    const parent = `projects/${projectId}/locations/${cloudRegion}`;
    const request = {parent, datasetId};

    await healthcare.projects.locations.datasets.create(request);
    console.log(`Created dataset: ${datasetId}`);
  }

  createDataset();
  // [END healthcare_create_dataset]
}

// node createDataset.js <projectId> <cloudRegion> <datasetId>
main(...process.argv.slice(2));
