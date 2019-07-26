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

const BASE_URL = 'https://healthcare.googleapis.com/v1beta1';

const getToken = (serviceAccountJson, cb) => {
  const gtoken = new GoogleToken({
    keyFile: `${serviceAccountJson}`,
    scope: ['https://www.googleapis.com/auth/cloud-platform'], // or space-delimited string of scopes
  });

  gtoken.getToken((err, token) => {
    if (err) {
      console.log('ERROR: ', err);
      return;
    }
    cb(token);
  });
};

// [START healthcare_dicomweb_store_instance]
const dicomWebStoreInstance = async (
  token,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  dcmFile
) => {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const dcmFile = 'IMG.dcm'
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const dicomWebPath = `${parentName}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies`;

  const binaryData = fs.readFileSync(dcmFile);

  const options = {
    url: dicomWebPath,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; type=application/dicom`,
    },
    body: binaryData,
    method: 'POST',
  };

  try {
    const results = await request(options);
    console.log('Stored instance:\n');
    console.log(results);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_dicomweb_store_instance]

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
    `dicomWebStoreInstance <datasetId> <dicomStoreId> <dcmFile>`,
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
          opts.dcmFile
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
