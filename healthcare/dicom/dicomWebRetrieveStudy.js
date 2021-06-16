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
  studyUid
) => {
  // [START healthcare_dicomweb_retrieve_study]
  const google = require('@googleapis/healthcare');
  const healthcare = google.healthcare({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    }),
  });
  const fs = require('fs');
  const util = require('util');
  const writeFile = util.promisify(fs.writeFile);
  // When specifying the output file, use an extension like ".multipart."
  // Then, parse the downloaded multipart file to get each individual
  // DICOM file.
  const fileName = 'study_file.multipart';

  const dicomWebRetrieveStudy = async () => {
    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const studyUid = '1.3.6.1.4.1.5062.55.1.2270943358.716200484.1363785608958.61.0';
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
    const dicomWebPath = `studies/${studyUid}`;
    const request = {parent, dicomWebPath};

    const study =
      await healthcare.projects.locations.datasets.dicomStores.studies.retrieveStudy(
        request,
        {
          headers: {
            Accept:
              'multipart/related; type=application/dicom; transfer-syntax=*',
          },
          responseType: 'arraybuffer',
        }
      );

    const fileBytes = Buffer.from(study.data);

    await writeFile(fileName, fileBytes);
    console.log(
      `Retrieved study and saved to ${fileName} in current directory`
    );
  };

  dicomWebRetrieveStudy();
  // [END healthcare_dicomweb_retrieve_study]
};

// node dicomWebRetrieveStudy.js <projectId> <cloudRegion> <datasetId> <dicomStoreId> <studyUid>
main(...process.argv.slice(2));
