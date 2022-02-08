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
  sourceDatasetId,
  destinationDatasetId,
  keeplistTags
) => {
  // [START healthcare_dicom_keeplist_deidentify_dataset]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  const deidentifyDataset = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const sourceDatasetId = 'my-source-dataset';
    // const destinationDatasetId = 'my-destination-dataset';
    // const keeplistTags = 'PatientID'
    const sourceDataset = `projects/${projectId}/locations/${cloudRegion}/datasets/${sourceDatasetId}`;
    const destinationDataset = `projects/${projectId}/locations/${cloudRegion}/datasets/${destinationDatasetId}`;
    const request = {
      sourceDataset: sourceDataset,
      destinationDataset: destinationDataset,
      resource: {
        config: {
          dicom: {
            keepList: {
              tags: [keeplistTags],
            },
          },
        },
      },
    };

    await healthcare.projects.locations.datasets.deidentify(request);
    console.log(
      `De-identified data written from dataset ${sourceDatasetId} to dataset ${destinationDatasetId}`
    );
  };

  deidentifyDataset();
  // [END healthcare_dicom_keeplist_deidentify_dataset]
};

// node deidentifyDataset.js <projectId> <cloudRegion> <sourceDatasetId> <destinationDatasetId> <keeplistTags>
main(...process.argv.slice(2));
