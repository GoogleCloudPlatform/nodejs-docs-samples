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

const fs = require('fs');
const {google} = require('googleapis');

// [START healthcare_create_hl7v2_message]
function createHl7v2Message(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  messageFile
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const messageFile = './hl7-sample-ingest.json';
  const hl7v2MessageParent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const hl7v2Message = fs.readFileSync(messageFile);
  const hl7v2MessageJson = JSON.parse(hl7v2Message);

  const request = {
    parent: hl7v2MessageParent,
    resource: hl7v2MessageJson,
  };

  client.projects.locations.datasets.hl7V2Stores.messages
    .create(request)
    .then(() => {
      console.log(`Created HL7v2 message`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_create_hl7v2_message]

// [START healthcare_ingest_hl7v2_message]
function ingestHl7v2Message(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  messageFile
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const messageFile = './hl7-sample-ingest.json';
  const hl7v2MessageParent = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const hl7v2Message = fs.readFileSync(messageFile);
  const hl7v2MessageJson = JSON.parse(hl7v2Message);

  const request = {
    parent: hl7v2MessageParent,
    resource: hl7v2MessageJson,
  };

  client.projects.locations.datasets.hl7V2Stores.messages
    .ingest(request)
    .then(() => {
      console.log(`Ingested HL7v2 message`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_ingest_hl7v2_message]

// [START healthcare_delete_hl7v2_message]
function deleteHl7v2Message(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  messageId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const messageId = 'E9_pxOBKhmlxiFxE4cg8zwJKUHMlOzIfeLBrZPf0Zg=';
  const hl7v2Message = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}/messages/${messageId}`;

  const request = {name: hl7v2Message};

  client.projects.locations.datasets.hl7V2Stores.messages
    .delete(request)
    .then(() => {
      console.log(`Deleted HL7v2 message with ID ${messageId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_delete_hl7v2_message]

// [START healthcare_get_hl7v2_message]
function getHl7v2Message(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  messageId
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const messageId = 'E9_pxOBKhmlxiFxE4cg8zwJKUHMlOzIfeLBrZPf0Zg=';
  const hl7v2Message = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}/messages/${messageId}`;

  const request = {name: hl7v2Message};

  client.projects.locations.datasets.hl7V2Stores.messages
    .get(request)
    .then(results => {
      console.log('Got HL7v2 message:');
      console.log(JSON.stringify(results.data, null, 2));
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_get_hl7v2_message]

// [START healthcare_list_hl7v2_messages]
function listHl7v2Messages(
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

  const request = {parent: hl7v2StoreName};

  client.projects.locations.datasets.hl7V2Stores.messages
    .list(request)
    .then(results => {
      console.log('HL7v2 messages:\n', results['data']['messages']);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_list_hl7v2_messages]

// [START healthcare_patch_hl7v2_message]
function patchHl7v2Message(
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  messageId,
  labelKey,
  labelValue
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(cb) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  // const messageId = 'E9_pxOBKhmlxiFxE4cg8zwJKUHMlOzIfeLBrZPf0Zg=';
  // const labelKey = 'my-key';
  // const labelValue = 'my-value';
  const hl7v2Message = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}/messages/${messageId}`;

  const request = {
    name: hl7v2Message,
    updateMask: 'labels',
    labels: {
      labelKey: labelValue,
    },
  };

  client.projects.locations.datasets.hl7V2Stores.messages
    .patch(request)
    .then(() => {
      console.log('Patched HL7v2 message');
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_patch_hl7v2_message]

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
    `createHl7v2Message <datasetId> <hl7v2StoreId> <messageFile>`,
    `Creates a new HL7v2 message and, if configured, sends a notification to the parent store's Cloud Pub/Sub topic.`,
    {},
    opts => {
      const cb = function(client) {
        createHl7v2Message(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.messageFile
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `ingestHl7v2Message <datasetId> <hl7v2StoreId> <messageFile>`,
    `Ingests a new HL7v2 message from the hospital and, if configured, sends a notification to the Cloud Pub/Sub topic.`,
    {},
    opts => {
      const cb = function(client) {
        ingestHl7v2Message(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.messageFile
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteHl7v2Message <datasetId> <hl7v2StoreId> <messageId>`,
    `Deletes the specified HL7v2 message.`,
    {},
    opts => {
      const cb = function(client) {
        deleteHl7v2Message(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.messageId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `getHl7v2Message <datasetId> <hl7v2StoreId> <messageId>`,
    `Gets the specified HL7v2 message.`,
    {},
    opts => {
      const cb = function(client) {
        getHl7v2Message(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.messageId
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `listHl7v2Messages <datasetId> <hl7v2StoreId>`,
    `Lists all the messages in the given HL7v2 store.`,
    {},
    opts => {
      const cb = function(client) {
        listHl7v2Messages(
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
    `patchHl7v2Message <datasetId> <hl7v2StoreId> <labelKey> <labelValue>`,
    `Updates the specified HL7v2 message.`,
    {},
    opts => {
      const cb = function(client) {
        patchHl7v2Message(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.hl7v2StoreId,
          opts.labelKey,
          opts.labelValue
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
