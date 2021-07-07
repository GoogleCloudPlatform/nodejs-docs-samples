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
  dcmFile
) => {
  // [START healthcare_dicomweb_store_instance]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });
  const fs = require('fs');

  const dicomWebStoreInstance = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const dcmFile = 'file.dcm';
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
    const dicomWebPath = 'studies';
    // Use a stream because other types of reads overwrite the client's HTTP
    // headers and cause storeInstances to fail.
    const binaryData = fs.createReadStream(dcmFile);
    const request = {
      parent,
      dicomWebPath,
      requestBody: binaryData,
    };

    const instance =
      await healthcare.projects.locations.datasets.dicomStores.storeInstances(
        request,
        {
          headers: {
            'Content-Type': 'application/dicom',
            Accept: 'application/dicom+json',
          },
        }
      );
    console.log('Stored DICOM instance:\n', JSON.stringify(instance.data));
  };

  dicomWebStoreInstance();
  // [END healthcare_dicomweb_store_instance]
};

// node dicomWebStoreInstance.js <projectId> <cloudRegion> <datasetId> <dicomStoreId> <dcmFile>
main(...process.argv.slice(2));
