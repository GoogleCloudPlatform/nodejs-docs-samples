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

const BASE_URL = 'https://healthcare.googleapis.com/v1alpha';

// [START healthcare_get_token]
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
// [END healthcare_get_token]

// [START healthcare_create_fhir_resource]
function createResource(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}`;

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

  request(options)
    .then(resource => {
      console.log(`Created resource ${resourceType} with ID ${resource.id}.`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_create_fhir_resource]

// [START healthcare_update_fhir_resource]
function updateResource(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}/${resourceId}`;

  const patientData = {
    resourceType: resourceType,
    id: resourceId,
    active: true,
  };

  const options = {
    url: resourcePath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    body: patientData,
    json: true,
    method: 'PUT',
  };

  request(options)
    .then(() => {
      console.log(`Updated ${resourceType} with ID ${resourceId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_update_fhir_resource]

// [START healthcare_patch_fhir_resource]
function patchResource(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}/${resourceId}`;

  const patchOperations = [{op: 'replace', path: '/active', value: false}];

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

  request(options)
    .then(() => {
      console.log(`Patched ${resourceType} with ID ${resourceId}`);
    })
    .catch(err => {
      console.log('ERROR:', err.message);
    });
}
// [END healthcare_patch_fhir_resource]

// [START healthcare_delete_fhir_resource]
function deleteResource(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}/${resourceId}`;

  const options = {
    url: resourcePath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    json: true,
    method: 'DELETE',
  };

  request(options)
    .then(() => {
      console.log(`Deleted ${resourceType} with ID ${resourceId}.`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_delete_fhir_resource]

// [START healthcare_get_fhir_resource]
function getResource(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType,
  resourceId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}/${resourceId}`;

  const options = {
    url: resourcePath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    json: true,
  };

  request(options)
    .then(results => {
      console.log(
        `Got ${resourceType} resource:\n${JSON.stringify(results, null, 2)}`
      );
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_get_fhir_resource]

// [START healthcare_search_fhir_resources_get]
function searchResourcesGet(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcesPath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}`;

  const options = {
    url: resourcesPath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    json: true,
  };

  request(options)
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_search_fhir_resources_get]

// [START healthcare_search_fhir_resources_post]
function searchResourcesPost(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceType
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceType = 'Patient';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const resourcesPath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/${resourceType}/_search`;

  const options = {
    url: resourcesPath,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json; charset=utf-8',
    },
    json: true,
    method: 'POST',
  };

  request(options)
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_search_fhir_resources_post]

// [START healthcare_fhir_get_patient_everything]
function getPatientEverything(
  token,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  resourceId
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const resourceId = 'd64a85ae-da1b-4a10-0eb8-cfaf55bdbe3f';
  const parentName = `${BASE_URL}/projects/${projectId}/locations/${cloudRegion}`;

  const fhirStorePath = `${parentName}/datasets/${datasetId}/fhirStores/${fhirStoreId}/resources/Patient/${resourceId}/$everything`;

  const options = {
    url: fhirStorePath,
    headers: {
      authorization: `Bearer ${token}`,
    },
    json: true,
  };

  request(options)
    .then(results => {
      console.log(`Got all resources in patient ${resourceId} compartment:`);
      console.log(results);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_fhir_get_patient_everything]

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
    opts => {
      const cb = function(token) {
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
    `updateResource <datasetId> <fhirStoreId> <resourceType> <resourceId>`,
    `Updates an existing resource in a FHIR store.`,
    {},
    opts => {
      const cb = function(token) {
        updateResource(
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
    `patchResource <datasetId> <fhirStoreId> <resourceType> <resourceId>`,
    `Patches an existing resource in a FHIR store.`,
    {},
    opts => {
      const cb = function(token) {
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
    `deleteResource <datasetId> <fhirStoreId> <resourceType> <resourceId>`,
    `Deletes a FHIR resource or returns NOT_FOUND if it doesn't exist.`,
    {},
    opts => {
      const cb = function(token) {
        deleteResource(
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
    `getResource <datasetId> <fhirStoreId> <resourceType> <resourceId>`,
    `Gets a FHIR resource.`,
    {},
    opts => {
      const cb = function(token) {
        getResource(
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
    `searchResourcesGet <datasetId> <fhirStoreId> <resourceType>`,
    `Searches resources in the given FHIR store using the searchResources GET method.`,
    {},
    opts => {
      const cb = function(token) {
        searchResourcesGet(
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
    `searchResourcesPost <datasetId> <fhirStoreId> <resourceType>`,
    `Searches resources in the given FHIR store using the _search POST method.`,
    {},
    opts => {
      const cb = function(token) {
        searchResourcesPost(
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
    `getPatientEverything <datasetId> <fhirStoreId> <resourceId>`,
    `Gets all the resources in the patient compartment.`,
    {},
    opts => {
      const cb = function(token) {
        getPatientEverything(
          token,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.fhirStoreId,
          opts.resourceId
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
