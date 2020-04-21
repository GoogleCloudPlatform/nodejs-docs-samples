// Copyright 2018 Google LLC
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

const {GoogleToken} = require('gtoken');
const request = require('request-promise');

const BASE_URL = 'https://healthcare.googleapis.com/v1';

// [START healthcare_get_token]
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
// [END healthcare_get_token]

// [START healthcare_create_resource]
const createResource = async (
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType
) => {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}`;

  const postData = {
    resourceType: resourceType,
  };

  const options = {
    url: resourcePath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    body: postData,
    json: true,
    method: 'POST',
  };

  try {
    const resource = await request(options);
    console.log(
      `Created FHIR resource ${resourceType} with ID ${resource.id}.`
    );
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_create_resource]

// [START healthcare_patch_resource]
const patchResource = async (
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) => {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir/${resourceType}/${resourceId}`;

  const patchOperations = [{op: 'replace', path: '/active', value: true}];

  const options = {
    url: resourcePath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json-patch+json',
    },
    body: patchOperations,
    json: true,
    method: 'PATCH',
  };

  try {
    await request(options);
    console.log(`Patched ${resourceType} resource`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_patch_resource]

// [START healthcare_fhir_execute_bundle]
const executeBundle = async (
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  bundleFile
) => {
  const fs = require('fs');
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const bundleFile = 'bundle.json';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcesPath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/fhir`;

  const bundle = fs.readFileSync(bundleFile);

  const options = {
    url: resourcesPath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    body: bundle,
    method: 'POST',
  };

  try {
    const results = await request(options);
    console.log('Executed Bundle\n');
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_fhir_execute_bundle]

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
    `createResource <datasetId> <fhirStoreId> <resourceType>`,
    `Creates a new resource in a FHIR store.`,
    {},
    (opts) => {
      const cb = (token) => {
        createResource(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.fhirStoreId,
          opts.resourceType
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .command(
    `patchResource <datasetId> <fhirStoreId> <resourceType> <resourceId>`,
    `Patches an existing resource in a FHIR store.`,
    {},
    (opts) => {
      const cb = (token) => {
        patchResource(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.fhirStoreId,
          opts.resourceType,
          opts.resourceId
        );
      };
      getToken(opts.serviceAccount, cb);
    }
  )
  .command(
    `executeBundle <datasetId> <fhirStoreId> <bundleFile>`,
    `Executes all the requests in the given Bundle.`,
    {},
    (opts) => {
      const cb = (token) => {
        executeBundle(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.fhirStoreId,
          opts.bundleFile
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
