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
  projectId = process.env.GOOGLE_CLOUD_PROJECT,
  cloudRegion = 'us-central1',
  datasetId,
  dicomStoreId,
  studyUid,
  seriesUid,
  instanceUid
) => {
  // [START healthcare_dicomweb_retrieve_instance]
  const {google} = require('googleapis');
  const healthcare = google.healthcare('v1');
  const fs = require('fs');
  const util = require('util');
  const writeFile = util.promisify(fs.writeFile);
  const fileName = 'instance_file.dcm';

  const dicomWebRetrieveInstance = async () => {
    const auth = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    google.options({
      auth,
      headers: {Accept: 'application/dicom; transfer-syntax=*'},
      responseType: 'arraybuffer',
    });

    // TODO(developer): uncomment these lines before running the sample
    // const cloudRegion = 'us-central1';
    // const projectId = 'adjective-noun-123';
    // const datasetId = 'my-dataset';
    // const dicomStoreId = 'my-dicom-store';
    // const studyUid = '1.3.6.1.4.1.5062.55.1.2270943358.716200484.1363785608958.61.0';
    // const seriesUid = '2.24.52329571877967561426579904912379710633';
    // const instanceUid = '1.3.6.2.4.2.14619.5.2.1.6280.6001.129311971280445372188125744148';
    const parent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;
    const dicomWebPath = `studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}`;
    const request = {parent, dicomWebPath};

    const instance = await healthcare.projects.locations.datasets.dicomStores.studies.series.instances.retrieveInstance(
      request
    );
    const fileBytes = Buffer.from(instance.data);

    await writeFile(fileName, fileBytes);
    console.log(
      `Retrieved DICOM instance and saved to ${fileName} in current directory`
    );
  };

  dicomWebRetrieveInstance();
  // [END healthcare_dicomweb_retrieve_instance]
};

// node dicomWebRetrieveInstance.js <projectId> <cloudRegion> <datasetId> <dicomStoreId> <studyUid> <seriesUid> <instanceUid>
main(...process.argv.slice(2));
