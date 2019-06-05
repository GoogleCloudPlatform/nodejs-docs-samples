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
const createDicomStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName, dicomStoreId: dicomStoreId};

  try {
    await client.projects.locations.datasets.dicomStores.create(request);
    console.log(`Created DICOM store: ${dicomStoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_create_dicom_store]

// [START healthcare_delete_dicom_store]
const deleteDicomStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {name: dicomStoreName};

  try {
    await client.projects.locations.datasets.dicomStores.delete(request);
    console.log(`Deleted DICOM store: ${dicomStoreId}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_delete_dicom_store]

// [START healthcare_get_dicom_store]
const getDicomStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId
) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {name: dicomStoreName};

  try {
    const results = await client.projects.locations.datasets.dicomStores.get(
      request
    );
    console.log('Got DICOM store:\n', results['data']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_get_dicom_store]

// [START healthcare_list_dicom_stores]
const listDicomStores = async (client, projectId, cloudRegion, datasetId) => {
  // Client retrieved in callback
  // getClient(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {parent: parentName};

  try {
    const results = await client.projects.locations.datasets.dicomStores.list(
      request
    );
    console.log('DICOM stores:\n', results['data']['dicomStores']);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_list_dicom_stores]

// [START healthcare_patch_dicom_store]
const patchDicomStore = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  pubsubTopic
) => {
  // Client retrieved in callback
  // getClient(apiKey);
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

  try {
    const results = await client.projects.locations.datasets.dicomStores.patch(
      request
    );
    console.log(
      'Patched DICOM store with Cloud Pub/Sub topic',
      results['data']['notificationConfig']['pubsubTopic']
    );
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_patch_dicom_store]

// [START healthcare_import_dicom_object]
const importDicomObject = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  gcsUri
) => {
  // Token retrieved in callback
  // getToken(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const gcsUri = 'my-bucket'
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {
    name: dicomStoreName,
    resource: {
      gcsSource: {
        uri: `gs://${gcsUri}`,
      },
    },
  };

  try {
    await client.projects.locations.datasets.dicomStores.import(request);
    console.log(`Imported DICOM objects from bucket ${gcsUri}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_import_dicom_object]

// [START healthcare_export_dicom_instance_gcs]
const exportDicomInstanceGcs = async (
  client,
  projectId,
  cloudRegion,
  datasetId,
  dicomStoreId,
  uriPrefix
) => {
  // Token retrieved in callback
  // getToken(apiKey);
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const dicomStoreId = 'my-dicom-store';
  // const uriPrefix = 'my-bucket'
  const dicomStoreName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}/dicomStores/${dicomStoreId}`;

  const request = {
    name: dicomStoreName,
    resource: {
      gcsDestination: {
        uriPrefix: `gs://${uriPrefix}`,
      },
    },
  };

  try {
    await client.projects.locations.datasets.dicomStores.export(request);
    console.log(`Exported DICOM instances to bucket ${uriPrefix}`);
  } catch (err) {
    console.error(err);
  }
};
// [END healthcare_export_dicom_instance_gcs]

// Returns an authorized API client by discovering the Healthcare API with
// the provided API key.
// [START healthcare_get_client]
const getClient = async apiKey => {
  const API_VERSION = 'v1alpha2';
  const DISCOVERY_API = 'https://healthcare.googleapis.com/$discovery/rest';

  const authClient = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const discoveryUrl = `${DISCOVERY_API}?labels=CHC_ALPHA&version=${API_VERSION}&key=${apiKey}`;

  google.options({auth: authClient});

  try {
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
    `createDicomStore <datasetId> <dicomStoreId>`,
    `Creates a new DICOM store within the parent dataset.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await createDicomStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId
      );
    }
  )
  .command(
    `deleteDicomStore <datasetId> <dicomStoreId>`,
    `Deletes the DICOM store and removes all resources that are contained within it.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await deleteDicomStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId
      );
    }
  )
  .command(
    `getDicomStore <datasetId> <dicomStoreId>`,
    `Gets the specified DICOM store or returns NOT_FOUND if it doesn't exist.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await getDicomStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId
      );
    }
  )
  .command(
    `listDicomStores <datasetId>`,
    `Lists the DICOM stores in the given dataset.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await listDicomStores(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId
      );
    }
  )
  .command(
    `patchDicomStore <datasetId> <dicomStoreId> <pubsubTopic>`,
    `Updates the DICOM store.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await patchDicomStore(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId,
        opts.pubsubTopic
      );
    }
  )
  .command(
    `importDicomObject <datasetId> <dicomStoreId> <gcsUri>`,
    `Imports data into the DICOM store by copying it from the specified source.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await importDicomObject(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId,
        opts.gcsUri
      );
    }
  )
  .command(
    `exportDicomInstanceGcs <datasetId> <dicomStoreId> <uriPrefix>`,
    `Exports data to a Cloud Storage bucket by copying it from the DICOM store.`,
    {},
    async opts => {
      const client = await getClient(opts.apiKey, opts.serviceAccount);
      await exportDicomInstanceGcs(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.datasetId,
        opts.dicomStoreId,
        opts.uriPrefix
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
