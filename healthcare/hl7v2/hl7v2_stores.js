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
const createHl7v2Store = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName, hl7V2StoreId: hl7v2StoreId};

  try {
    await client.projects.locations.datasets.hl7V2Stores.create(request);
    console.log(`Created HL7v2 store: ${hl7v2StoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_create_hl7v2_store]

// [START healthcare_delete_hl7v2_store]
const deleteHl7v2Store = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const hl7v2StoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const request = {name: hl7v2StoreName};

  try {
    await client.projects.locations.datasets.hl7V2Stores.delete(request);
    console.log(`Deleted HL7v2 store: ${hl7v2StoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_delete_hl7v2_store]

// [START healthcare_get_hl7v2_store]
const getHl7v2Store = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const hl7v2StoreId = 'my-hl7v2-store';
  const hl7v2StoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/hl7V2Stores/${hl7v2StoreId}`;

  const request = {name: hl7v2StoreName};

  try {
    const results = await client.projects.locations.datasets.hl7V2Stores.get(
      request
    );
    console.log('Got HL7v2 store:\n', results['data']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_get_hl7v2_store]

// [START healthcare_list_hl7v2_stores]
const listHl7v2Stores = async (client, projectId, cloudRegion, datasetId) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName};

  try {
    const results = await client.projects.locations.datasets.hl7V2Stores.list(
      request
    );
    console.log('HL7v2 stores:\n', results['data']['hl7v2Stores']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_list_hl7v2_stores]

// [START healthcare_patch_hl7v2_store]
const patchHl7v2Store = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  hl7v2StoreId,
  pubsubTopic
) => {
  // Client retrieved in callback
  // getClient(apiKey);
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
        pubsubTopic: `projects/${projectId}/topics/${pubsubTopic}`,
      },
    },
  };

  try {
    const results = await client.projects.locations.datasets.hl7V2Stores.patch(
      request
    );
    console.log(
      'Patched HL7v2 store with Cloud Pub/Sub topic',
      results['data']['notificationConfig']['pubsubTopic']
    );
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_patch_hl7v2_store]

// Returns an authorized API client by discovering the Healthcare API with
// the provided API key.
// [START healthcare_get_client]
const getClient = async apiKey => {
  const API_VERSION = 'v1alpha2';
  const DISCOVERY_API = 'https://healthcare.googleapis.com/$discovery/rest';

  try {
    const authClient = await google.auth.getClient({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const discoveryUrl = `${DISCOVERY_API}?labels=CHC_ALPHA&version=${API_VERSION}&key=${apiKey}`;

    google.options({auth: authClient});

    return google.discoverAPI(discoveryUrl);
  } catch (err) {
    console.error(err);
  }
};
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
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await createHl7v2Store(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.hl7v2StoreId
      );
    }
  )
  .command(
    `deleteHl7v2Store <datasetId> <hl7v2StoreId>`,
    `Deletes the HL7v2 store and removes all resources that are contained within it.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await deleteHl7v2Store(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.hl7v2StoreId
      );
    }
  )
  .command(
    `getHl7v2Store <datasetId> <hl7v2StoreId>`,
    `Gets the specified HL7v2 store or returns NOT_FOUND if it doesn't exist.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await getHl7v2Store(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.hl7v2StoreId
      );
    }
  )
  .command(
    `listHl7v2Stores <datasetId>`,
    `Lists the HL7v2 stores in the given dataset.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await listHl7v2Stores(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId
      );
    }
  )
  .command(
    `patchHl7v2Store <datasetId> <hl7v2StoreId> <pubsubTopic>`,
    `Updates the HL7v2 store.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await patchHl7v2Store(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.hl7v2StoreId,
        opts.pubsubTopic
      );
    }
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/healthcare/docs`
  )
  .help()
  .strict().argv;
