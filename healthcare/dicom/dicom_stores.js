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

'use strict';

const {google} = require('googleapis');

// [START healthcare_create_dicom_store]
function createDicomStore(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName, dicomStoreId: dicomStoreId};

  client.projects.locations.datasets.dicomStores
    .create(request)
    .then(() => {
      console.log(`Created DICOM store: ${dicomStoreId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_create_dicom_store]

// [START healthcare_delete_dicom_store]
function deleteDicomStore(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {name: dicomStoreName};

  client.projects.locations.datasets.dicomStores
    .delete(request)
    .then(() => {
      console.log(`Deleted DICOM store: ${dicomStoreId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_delete_dicom_store]

// [START healthcare_get_dicom_store]
function getDicomStore(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {name: dicomStoreName};

  client.projects.locations.datasets.dicomStores
    .get(request)
    .then(results => {
      console.log('Got DICOM store:\n', results['data']);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_get_dicom_store]

// [START healthcare_list_dicom_stores]
function listDicomStores(client, projectId, cloudRegion, datasetId) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName};

  client.projects.locations.datasets.dicomStores
    .list(request)
    .then(results => {
      console.log('DICOM stores:\n', results['data']['dicomStores']);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_list_dicom_stores]

// [START healthcare_patch_dicom_store]
function patchDicomStore(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  pubsubTopic
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const pubsubTopic = 'my-topic'
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {
    name: dicomStoreName,
    updateMask: 'notificationConfig',
    resource: {
      notificationConfig: {
        pubsubTopic: `projects/${projectId}/locations/${cloudRegion}/topics/${pubsubTopic}`,
      },
    },
  };

  client.projects.locations.datasets.dicomStores
    .patch(request)
    .then(results => {
      console.log(
        'Patched DICOM store with Cloud Pub/Sub topic',
        results['data']['notificationConfig']['pubsubTopic']
      );
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_patch_dicom_store]

// [START healthcare_import_dicom_object]
function importDicomObject(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  contentUri
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const contentUri = 'my-bucket'
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {
    name: dicomStoreName,
    resource: {
      inputConfig: {
        gcsSource: {
          contentUri: `gs://${contentUri}`,
        },
      },
    },
  };

  client.projects.locations.datasets.dicomStores
    .import(request)
    .then(() => {
      console.log(`Imported DICOM objects from bucket ${contentUri}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_import_dicom_object]

// [START healthcare_export_dicom_instance_gcs]
function exportDicomInstanceGcs(
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  uriPrefix
) {
  // Token retrieved in callback
  // getToken(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const uriPrefix = 'my-bucket'
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {
    name: dicomStoreName,
    resource: {
      outputConfig: {
        gcsDestination: {
          uriPrefix: `gs://${uriPrefix}`,
        },
      },
    },
  };

  client.projects.locations.datasets.dicomStores
    .export(request)
    .then(() => {
      console.log(`Exported DICOM instances to bucket ${uriPrefix}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_export_dicom_instance_gcs]

// Returns an authorized API client by discovering the Healthcare API with
// the provided API key.
// [START healthcare_get_client]
function getClient(apiKey, serviceAccountJson, cb) {
  const API_VERSION = 'v1alpha';
  const DISCOVERY_API = 'https://healthcare.googleapis.com/$discovery/rest';

  google.auth
    .getClient({scopes: ['https://www.googleapis.com/auth/cloud-platform']})
    .then(authClient => {
      const discoveryUrl = `${DISCOVERY_API}?labels=CHC_ALPHA&version=${API_VERSION}&key=${apiKey}`;

      google.options({auth: authClient});

      google
        .discoverAPI(discoveryUrl)
        .then(client => {
          cb(client);
        })
        .catch(err => {
          console.error(err);
        });
    });
}
// [END healthcare_get_client]

require(`yargs`) // eslint-disable-line
  .demand(1)
  .options({
    apiKey: {
      alias: 'a',
      default: process.env.API_KEY,
      description: 'The API key used for discovering the API.',
      requiresArg: true,
      type: 'string',
    },
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
    `createDicomStore <datasetId> <dicomStoreId>`,
    `Creates a new DICOM store within the parent dataset.`,
    {},
    opts => {
      const cb = function(client) {
        createDicomStore(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteDicomStore <datasetId> <dicomStoreId>`,
    `Deletes the DICOM store and removes all resources that are contained within it.`,
    {},
    opts => {
      const cb = function(client) {
        deleteDicomStore(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `getDicomStore <datasetId> <dicomStoreId>`,
    `Gets the specified DICOM store or returns NOT_FOUND if it doesn't exist.`,
    {},
    opts => {
      const cb = function(client) {
        getDicomStore(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `listDicomStores <datasetId>`,
    `Lists the DICOM stores in the given dataset.`,
    {},
    opts => {
      const cb = function(client) {
        listDicomStores(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `patchDicomStore <datasetId> <dicomStoreId> <pubsubTopic>`,
    `Updates the DICOM store.`,
    {},
    opts => {
      const cb = function(client) {
        patchDicomStore(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.pubsubTopic
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `importDicomObject <datasetId> <dicomStoreId> <contentUri>`,
    `Imports data into the DICOM store by copying it from the specified source.`,
    {},
    opts => {
      const cb = function(client) {
        importDicomObject(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.contentUri
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `exportDicomInstanceGcs <datasetId> <dicomStoreId> <uriPrefix>`,
    `Exports data to a Cloud Storage bucket by copying it from the DICOM store.`,
    {},
    opts => {
      const cb = function(client) {
        exportDicomInstanceGcs(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.dicomStoreId,
          opts.uriPrefix
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/healthcare/docs`
  )
  .help()
  .strict().argv;
