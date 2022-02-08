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
  dicomStoreId,
  gcsUri
) => {
  // [START healthcare_export_dicom_instance_gcs]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });

  const exportDicomInstanceGcs = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const gcsUri = 'my-bucket/my-directory'
    const name = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
    const request = {
      name,
      resource: {
        gcsDestination: {
          // The destination location of the DICOM instances in Cloud Storage
          uriPrefix: `gs://${gcsUri}`,
          // The format to use for the output files, per the MIME types supported in the DICOM spec
          mimeType: 'application/dicom',
        },
      },
    };

    await healthcare.projects.locations.datasets.dicomStores.export(request);
    console.log(`Exported DICOM instances to ${gcsUri}`);
  };

  exportDicomInstanceGcs();
  // [END healthcare_export_dicom_instance_gcs]
};

// node exportDicomInstanceGcs.js <projectId> <cloudRegion> <datasetId> <dicomStoreId> <gcsUri>
main(...process.argv.slice(2));
