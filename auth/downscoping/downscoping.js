// Copyright 2021, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const downscopingWithCredentialAccessBoundary = async ({
  bucketName,
  objectName,
}) => {
  // [START auth_downscoping_with_credential_access_boundary]
  // Imports the Google Auth and Google Cloud libraries.
  const {
    OAuth2Client,
    GoogleAuth,
    DownscopedClient,
  } = require('google-auth-library');
  const {Storage} = require('@google-cloud/storage');

  async function getTokenFromBroker(bucketName, objectName) {
    // [START auth_downscoping_token_broker]
    const googleAuth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    // [START auth_downscoping_rules]
    // Define the Credential Access Boundary object.
    const cab = {
      // Define the single access boundary rule with below properties.
      accessBoundary: {
        // Initialize the Credential Access Boundary rules.
        accessBoundaryRules: [
          {
            availableResource: `//storage.googleapis.com/projects/_/buckets/${bucketName}`,
            // Downscoped credentials will have readonly access to the resource.
            availablePermissions: ['inRole:roles/storage.objectViewer'],
            // Only objects starting with the specified prefix string in the object name
            // will be allowed read access.
            availabilityCondition: {
              expression:
                "resource.name.startsWith('projects/_/buckets/" +
                `${bucketName}/objects/${objectName}')`,
            },
          },
        ],
      },
    };
    // [END auth_downscoping_rules]

    // [START auth_downscoping_initialize_downscoped_cred]
    // Obtain an authenticated client.
    const client = await googleAuth.getClient();
    // Use the client to generate a DownscopedClient.
    const cabClient = new DownscopedClient(client, cab);
    const refreshedAccessToken = await cabClient.getAccessToken();
    // [END auth_downscoping_initialize_downscoped_cred]
    return refreshedAccessToken;
    // [END auth_downscoping_token_broker]
  }

  async function tokenConsumer(bucketName, objectName) {
    // [START auth_downscoping_token_consumer]
    const oauth2Client = new OAuth2Client();
    oauth2Client.refreshHandler = async () => {
      const refreshedAccessToken = await getTokenFromBroker(
        bucketName,
        objectName
      );
      return {
        access_token: refreshedAccessToken.token,
        expiry_date: refreshedAccessToken.expirationTime,
      };
    };

    const storageOptions = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      authClient: {
        getClient: () => oauth2Client,
        getCredentials: async () => {
          Promise.reject();
        },
        request: opts => {
          return oauth2Client.request(opts);
        },
        authorizeRequest: async opts => {
          opts = opts || {};
          const url = opts.url || opts.uri;
          const headers = await oauth2Client.getRequestHeaders(url);
          opts.headers = Object.assign(opts.headers || {}, headers);
          return opts;
        },
      },
    };

    const storage = new Storage(storageOptions);
    const downloadFile = await storage
      .bucket(bucketName)
      .file(objectName)
      .download();
    console.log(downloadFile.toString('utf8'));
    // [END auth_downscoping_token_consumer]
  }

  try {
    tokenConsumer(bucketName, objectName);
  } catch (error) {
    console.log(error);
  }
  // [END auth_downscoping_with_credential_access_boundary]
};

const cli = require('yargs')
  .demand(2)
  .command(
    'auth-downscoping-with-credential-access-boundary',
    'Loads Application Default Credentials.',
    {
      bucketName: {
        alias: 'b',
        default: 'bucket-downscoping-test',
      },
      objectName: {
        alias: 'o',
        default: 'object-downscoping-test',
      },
    },
    downscopingWithCredentialAccessBoundary
  )
  .example(
    'node $0 auth-downscoping-with-credential-access-boundary',
    'Loads Application Default Credentials.'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    'For more information, see https://cloud.google.com/docs/authentication'
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
