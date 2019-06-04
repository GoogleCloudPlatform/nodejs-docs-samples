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

// [START healthcare_create_fhir_store]
const createFhirStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName, fhirStoreId: fhirStoreId};

  try {
    await client.projects.locations.datasets.fhirStores.create(request);
    console.log(`Created FHIR store: ${fhirStoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_create_fhir_store]

// [START healthcare_delete_fhir_store]
const deleteFhirStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  const fhirStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

  const request = {name: fhirStoreName};

  try {
    await client.projects.locations.datasets.fhirStores.delete(request);
    console.log(`Deleted FHIR store: ${fhirStoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_delete_fhir_store]

// [START healthcare_get_fhir_store]
const getFhirStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  const fhirStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

  const request = {name: fhirStoreName};

  try {
    const results = await client.projects.locations.datasets.fhirStores.get(
      request
    );
    console.log('Got FHIR store:\n', results['data']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_get_fhir_store]

// [START healthcare_list_fhir_stores]
const listFhirStores = async (client, projectId, cloudRegion, datasetId) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName};

  try {
    const results = await client.projects.locations.datasets.fhirStores.list(
      request
    );
    console.log('FHIR stores:\n', results['data']['fhirStores']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_list_fhir_stores]

// [START healthcare_patch_fhir_store]
const patchFhirStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId,
  pubsubTopic
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  // const pubsubTopic = 'my-topic'
  const fhirStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

  const request = {
    name: fhirStoreName,
    updateMask: 'notificationConfig',
    resource: {
      notificationConfig: {
        pubsubTopic: `projects/${projectId}/topics/${pubsubTopic}`,
      },
    },
  };

  try {
    const results = await client.projects.locations.datasets.fhirStores.patch(
      request
    );
    console.log(
      'Patched FHIR store with Cloud Pub/Sub topic',
      results['data']['notificationConfig']['pubsubTopic']
    );
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_patch_fhir_store]

// [START healthcare_get_fhir_store_metadata]
const getMetadata = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  fhirStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const fhirStoreId = 'my-fhir-store';
  const fhirStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/fhirStores/${fhirStoreId}`;

  const request = {name: fhirStoreName};

  try {
    const results = await client.projects.locations.datasets.fhirStores.capabilities(
      request
    );
    console.log(`Capabilities statement for FHIR store ${fhirStoreId}:`);
    console.log(results);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_get_fhir_store_metadata]

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
  })
  .command(
    `createFhirStore <datasetId> <fhirStoreId>`,
    `Creates a new FHIR store within the parent dataset.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await createFhirStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.fhirStoreId
      );
    }
  )
  .command(
    `deleteFhirStore <datasetId> <fhirStoreId>`,
    `Deletes the FHIR store and removes all resources that are contained within it.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await deleteFhirStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.fhirStoreId
      );
    }
  )
  .command(
    `getFhirStore <datasetId> <fhirStoreId>`,
    `Gets the specified FHIR store or returns NOT_FOUND if it doesn't exist.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await getFhirStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.fhirStoreId
      );
    }
  )
  .command(
    `listFhirStores <datasetId>`,
    `Lists the FHIR stores in the given dataset.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await listFhirStores(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId
      );
    }
  )
  .command(
    `patchFhirStore <datasetId> <fhirStoreId> <pubsubTopic>`,
    `Updates the FHIR store.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await patchFhirStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.fhirStoreId,
        opts.pubsubTopic
      );
    }
  )
  .command(
    `getMetadata <datasetId> <fhirStoreId>`,
    `Gets the capabilities statement for a FHIR store.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey);
      await getMetadata(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.fhirStoreId
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
