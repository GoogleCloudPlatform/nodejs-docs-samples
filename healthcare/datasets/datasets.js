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

// [START healthcare_create_dataset]
function createDataset(client, projectId, cloudRegion, datasetId) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;

  const request = {parent: parentName, datasetId: datasetId};

  client.projects.locations.datasets
    .create(request)
    .then(() => {
      console.log(`Created dataset: ${datasetId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_create_dataset]

// [START healthcare_delete_dataset]
function deleteDataset(client, projectId, cloudRegion, datasetId) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const datasetName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {name: datasetName};

  client.projects.locations.datasets
    .delete(request)
    .then(() => {
      console.log(`Deleted dataset: ${datasetId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_delete_dataset]

// [START healthcare_get_dataset]
function getDataset(client, projectId, cloudRegion, datasetId) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  const datasetName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {name: datasetName};

  client.projects.locations.datasets
    .get(request)
    .then(results => {
      console.log('Got dataset:\n', results.data);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_get_dataset]

// [START healthcare_list_datasets]
function listDatasets(client, projectId, cloudRegion) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;

  const request = {parent: parentName};

  client.projects.locations.datasets
    .list(request)
    .then(results => {
      console.log('Datasets:', results.data);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_list_datasets]

// [START healthcare_patch_dataset]
function patchDataset(client, projectId, cloudRegion, datasetId, timeZone) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const datasetId = 'my-dataset';
  // const timeZone = 'GMT'
  const datasetName = `projects/${projectId}/locations/${cloudRegion}/datasets/${datasetId}`;

  const request = {
    name: datasetName,
    updateMask: 'timeZone',
    resource: {timeZone: timeZone},
  };

  client.projects.locations.datasets
    .patch(request)
    .then(results => {
      console.log(
        `Dataset ${datasetId} patched with time zone ${results.data.timeZone}`
      );
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_patch_dataset]

// [START healthcare_deidentify_dataset]
function deidentifyDataset(
  client,
  projectId,
  cloudRegion,
  sourceDatasetId,
  destinationDatasetId,
  whitelistTags
) {
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const sourceDatasetId = 'my-dataset';
  // const destinationDatasetId = 'my-destination-dataset';
  // const whitelistTags = 'PatientID';
  const sourceDatasetName = `projects/${projectId}/locations/${cloudRegion}/datasets/${sourceDatasetId}`;
  const destinationDatasetName = `projects/${projectId}/locations/${cloudRegion}/datasets/${destinationDatasetId}`;

  const request = {
    sourceDataset: sourceDatasetName,
    destinationDataset: destinationDatasetName,
    resource: {config: {dicom: {whitelistTags: whitelistTags}}},
  };

  client.projects.locations.datasets
    .deidentify(request)
    .then(() => {
      console.log(`De-identified data written from dataset
            ${sourceDatasetId} to dataset ${destinationDatasetId}`);
    })
    .catch(err => {
      console.error(err);
    });
}
// [END healthcare_deidentify_dataset]

// [START healthcare_get_client]
// Returns an authorized API client by discovering the Healthcare API with
// the provided API key.
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
          console.log(`Error during API discovery: ${err}`);
        });
    });
}
// [END healthcare_get_client]

require(`yargs`)  // eslint-disable-line
  .demand(1)
  .options({
    apiKey: {
      alias: 'a',
      default: process.env.API_KEY,
      description:
        'The API key used for discovering the API. ' +
        'Defaults to the value of the API_KEY environment variable.',
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
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
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
    `createDataset <datasetId>`,
    `Creates a new health dataset.`,
    {},
    opts => {
      const cb = function(client) {
        createDataset(client, opts.projectId, opts.cloudRegion, opts.datasetId);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteDataset <datasetId>`,
    `Deletes the specified health dataset and all data contained
        in the dataset.`,
    {},
    opts => {
      const cb = function(client) {
        deleteDataset(client, opts.projectId, opts.cloudRegion, opts.datasetId);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `getDataset <datasetId>`,
    `Gets any metadata associated with a dataset.`,
    {},
    opts => {
      const cb = function(client) {
        getDataset(client, opts.projectId, opts.cloudRegion, opts.datasetId);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `listDatasets`,
    `Lists the datasets in the given GCP project.`,
    {},
    opts => {
      const cb = function(client) {
        listDatasets(client, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `patchDataset <datasetId> <timeZone>`,
    `Updates dataset metadata.`,
    {},
    opts => {
      const cb = function(client) {
        patchDataset(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.datasetId,
          opts.timeZone
        );
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deidentifyDataset <sourceDatasetId> <destinationDatasetId>
        <whitelistTags>`,
    `Creates a new dataset containing de-identified data from the
        source dataset.`,
    {},
    opts => {
      const cb = function(client) {
        deidentifyDataset(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.sourceDatasetId,
          opts.destinationDatasetId,
          opts.whitelistTags
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
