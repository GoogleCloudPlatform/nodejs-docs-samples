/**
 * Copyright 2018, Google, LLC
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

const {GoogleToken} = require('gtoken');
const request = require('request-promise');
const fs = require('fs');

const BASE_URL = 'https://healthcare.googleapis.com/v1alpha';

function getToken(serviceAccountJson, cb) {
  const gtoken = new GoogleToken({
    keyFile: `${serviceAccountJson}`,
    scope: ['https://www.googleapis.com/auth/cloud-platform'], // or space-delimited string of scopes
  });

  gtoken.getToken(function(err, token) {
    if (err) {
      console.log('ERROR: ', err);
      return;
    }
    cb(token);
  });
}

// [START healthcare_dicomweb_store_instance]
function dicomWebStoreInstance(
  token,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  dcmFile,
  boundary
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const dcmFile = 'IMG.dcm'
  // const boundary = 'DICOMwebBoundary'
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const dicomWebPath = `${parentName}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies`;

  const binaryData = fs.readFileSync(dcmFile);

  const options = {
    url: dicomWebPath,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; type=application/dicom; boundary=${boundary}`,
    },
    body: binaryData,
    method: 'POST',
  };

  request(options)
    .then(results => {
      console.log('Stored instance:\n');
      console.log(results);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_dicomweb_store_instance]

// [START healthcare_dicomweb_search_instances]
function dicomWebSearchInstances(
  token,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const dicomWebPath = `${parentName}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/instances`;

  const options = {
    url: dicomWebPath,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/dicom+json; charset=utf-8',
    },
    method: 'GET',
  };

  request(options)
    .then(results => {
      console.log('Instances:\n');
      console.log(results);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_dicomweb_search_instances]

// [START healthcare_dicomweb_retrieve_study]
function dicomWebRetrieveStudy(
  token,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  studyUid
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const studyUid = '1.2.345.678901.2.345.6789.0123456.7890.1234567890.123'
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const dicomWebPath = `${parentName}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}`;

  const options = {
    url: dicomWebPath,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/dicom+json; charset=utf-8',
    },
    method: 'GET',
  };

  request(options)
    .then(() => {
      console.log(`Retrieved study with UID: ${studyUid}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_dicomweb_retrieve_study]

// [START healthcare_dicomweb_delete_study]
function dicomWebDeleteStudy(
  token,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  studyUid
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const studyUid = '1.2.345.678901.2.345.6789.0123456.7890.1234567890.123'
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const dicomWebPath = `${parentName}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}`;

  const options = {
    url: dicomWebPath,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/dicom+json; charset=utf-8',
    },
    method: 'DELETE',
  };

  request(options)
    .then(() => {
      console.log('Deleted study.');
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_dicomweb_delete_study]

require(`yargs`) // eslint-disable-line
  .demand(1)
  .options({
    cloudRegion: {
      alias: 'c',
      default: 'us-central1',
      requiresArg: true,
      type: 'string',
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
    serviceAccount: {
      alias: 's',
      default: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      description: 'The path to your service credentials JSON.',
      requiresArg: true,
      type: 'string',
    },
  })
  .command(
    `dicomWebStoreInstance <datasetId> <dicomStoreId> <dcmFile> <boundary>`,
    `Handles the POST requests specified in the DICOMweb standard.`,
    {},
    opts => {
      const cb = function(token) {
        dicomWebStoreInstance(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.dcmFile,
          opts.boundary
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .command(
    `dicomWebSearchInstances <datasetId> <dicomStoreId>`,
    `Handles the GET requests specified in the DICOMweb standard.`,
    {},
    opts => {
      const cb = function(token) {
        dicomWebSearchInstances(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .command(
    `dicomWebRetrieveStudy <datasetId> <dicomStoreId> <studyUid>`,
    `Handles the GET requests specified in the DICOMweb standard.`,
    {},
    opts => {
      const cb = function(token) {
        dicomWebRetrieveStudy(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.studyUid
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .command(
    `dicomWebDeleteStudy <datasetId> <dicomStoreId> <studyUid>`,
    `Handles DELETE requests.`,
    {},
    opts => {
      const cb = function(token) {
        dicomWebDeleteStudy(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.studyUid
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/healthcare/docs`
  )
  .help()
  .strict().argv;
