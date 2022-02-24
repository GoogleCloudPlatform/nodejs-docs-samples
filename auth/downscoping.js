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
  // [START auth_downscoping_token_broker]
  // Imports the Google Auth libraries.
  const {GoogleAuth, DownscopedClient} = require('google-auth-library');
  /**
   * Simulates token broker generating downscoped tokens for specified bucket.
   *
   * @param bucketName The name of the Cloud Storage bucket.
   * @param objectPrefix The prefix string of the object name. This is used
   *        to ensure access is restricted to only objects starting with this
   *        prefix string.
   */
  async function getTokenFromBroker(bucketName, objectPrefix) {
    const googleAuth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    // [START auth_downscoping_rules]
    // Define the Credential Access Boundary object.
    const cab = {
      // Define the access boundary.
      accessBoundary: {
        // Define the single access boundary rule.
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
                `${bucketName}/objects/${objectPrefix}')`,
            },
          },
        ],
      },
    };
    // [END auth_downscoping_rules]

    // [START auth_downscoping_initialize_downscoped_cred]
    // Obtain an authenticated client via ADC.
    const client = await googleAuth.getClient();

    // Use the client to create a DownscopedClient.
    const cabClient = new DownscopedClient(client, cab);

    // Refresh the tokens.
    const refreshedAccessToken = await cabClient.getAccessToken();
    // [END auth_downscoping_initialize_downscoped_cred]

    // This will need to be passed to the token consumer.
    return refreshedAccessToken;
  }
  // [END auth_downscoping_token_broker]

  // [START auth_downscoping_token_consumer]
  // Imports the Google Auth and Google Cloud libraries.
  const {OAuth2Client} = require('google-auth-library');
  const {Storage} = require('@google-cloud/storage');
  /**
   * Simulates token consumer generating calling GCS APIs using generated
   * downscoped tokens for specified bucket.
   *
   * @param bucketName The name of the Cloud Storage bucket.
   * @param objectName The name of the object in the Cloud Storage bucket
   *        to read.
   */
  async function tokenConsumer(bucketName, objectName) {
    // Create the OAuth credentials (the consumer).
    const oauth2Client = new OAuth2Client();
    // We are defining a refresh handler instead of a one-time access
    // token/expiry pair.
    // This will allow the consumer to obtain new downscoped tokens on
    // demand every time a token is expired, without any additional code
    // changes.
    oauth2Client.refreshHandler = async () => {
      // The common pattern of usage is to have a token broker pass the
      // downscoped short-lived access tokens to a token consumer via some
      // secure authenticated channel. For illustration purposes, we are
      // generating the downscoped token locally. We want to test the ability
      // to limit access to objects with a certain prefix string in the
      // resource bucket. objectName.substring(0, 3) is the prefix here. This
      // field is not required if access to all bucket resources are allowed.
      // If access to limited resources in the bucket is needed, this mechanism
      // can be used.
      const refreshedAccessToken = await getTokenFromBroker(
        bucketName,
        objectName.substring(0, 3)
      );
      return {
        access_token: refreshedAccessToken.token,
        expiry_date: refreshedAccessToken.expirationTime,
      };
    };

    const storageOptions = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      authClient: oauth2Client,
    };

    const storage = new Storage(storageOptions);
    const downloadFile = await storage
      .bucket(bucketName)
      .file(objectName)
      .download();
    console.log(downloadFile.toString('utf8'));
  }
  // [END auth_downscoping_token_consumer]

  try {
    tokenConsumer(bucketName, objectName);
  } catch (error) {
    console.log(error);
  }
};

// TODO(developer): Replace these variables before running the sample.
// The Cloud Storage bucket name.
const bucketName = 'your-gcs-bucket-name';
// The Cloud Storage object name that resides in the specified bucket.
const objectName = 'your-gcs-object-name';

const cli = require('yargs')
  .demand(2)
  .command(
    'auth-downscoping-with-credential-access-boundary',
    'Loads Downscoped Credentials.',
    {
      bucketName: {
        alias: 'b',
        default: bucketName,
      },
      objectName: {
        alias: 'o',
        default: objectName,
      },
    },
    downscopingWithCredentialAccessBoundary
  )
  .example(
    'node $0 auth-downscoping-with-credential-access-boundary -b your-gcs-bucket-name -o your-gcs-object-name',
    'Loads Downscoped Credentials.'
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    'For more information, see https://cloud.google.com/iam/docs/downscoping-short-lived-credentials'
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
