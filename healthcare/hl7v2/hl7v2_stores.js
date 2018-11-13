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

// [START healthcare_create_hl7v2_store]
function createHl7v2Store(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName, hl7V2StoreId: hl7v2StoreId};

  client.projects.locations.datasets.hl7V2Stores
    .create(request)
    .then(() => {
      console.log(`Created HL7v2 store: ${hl7v2StoreId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_create_hl7v2_store]

// [START healthcare_delete_hl7v2_store]
function deleteHl7v2Store(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const hl7v2StoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const request = {name: hl7v2StoreName};

  client.projects.locations.datasets.hl7V2Stores
    .delete(request)
    .then(() => {
      console.log(`Deleted HL7v2 store: ${hl7v2StoreId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_delete_hl7v2_store]

// [START healthcare_get_hl7v2_store]
function getHl7v2Store(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const hl7v2StoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const request = {name: hl7v2StoreName};

  client.projects.locations.datasets.hl7V2Stores
    .get(request)
    .then(results => {
      console.log('Got HL7v2 store:\n', results['data']);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_get_hl7v2_store]

// [START healthcare_list_hl7v2_stores]
function listHl7v2Stores(client, projectId, cloudRegion, datasetId) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName};

  client.projects.locations.datasets.hl7V2Stores
    .list(request)
    .then(results => {
      console.log('HL7v2 stores:\n', results['data']['hl7v2Stores']);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_list_hl7v2_stores]

// [START healthcare_patch_hl7v2_store]
function patchHl7v2Store(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  pubsubTopic
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const pubsubTopic = 'my-topic'
  const hl7v2StoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const request = {
    name: hl7v2StoreName,
    updateMask: 'notificationConfig',
    resource: {
      notificationConfig: {
        pubsubTopic: `projects/${projectId}/locations/${cloudRegion}/topics/${pubsubTopic}`,
      },
    },
  };

  client.projects.locations.datasets.hl7V2Stores
    .patch(request)
    .then(results => {
      console.log(
        'Patched HL7v2 store with Cloud Pub/Sub topic',
        results['data']['notificationConfig']['pubsubTopic']
      );
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_patch_hl7v2_store]

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
    `createHl7v2Store <datasetId> <hl7v2StoreId>`,
    `Creates a new HL7v2 store within the parent dataset.`,
    {},
    opts => {
      const cb = function(client) {
        createHl7v2Store(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteHl7v2Store <datasetId> <hl7v2StoreId>`,
    `Deletes the HL7v2 store and removes all resources that are contained within it.`,
    {},
    opts => {
      const cb = function(client) {
        deleteHl7v2Store(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `getHl7v2Store <datasetId> <hl7v2StoreId>`,
    `Gets the specified HL7v2 store or returns NOT_FOUND if it doesn't exist.`,
    {},
    opts => {
      const cb = function(client) {
        getHl7v2Store(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `listHl7v2Stores <datasetId>`,
    `Lists the HL7v2 stores in the given dataset.`,
    {},
    opts => {
      const cb = function(client) {
        listHl7v2Stores(
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
    `patchHl7v2Store <datasetId> <hl7v2StoreId> <pubsubTopic>`,
    `Updates the HL7v2 store.`,
    {},
    opts => {
      const cb = function(client) {
        patchHl7v2Store(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.pubsubTopic
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
