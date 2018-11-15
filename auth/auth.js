/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Demonstrates how to authenticate to Google Cloud Platform APIs using the
 * Google Cloud Client Libraries.
 */

'use strict';

function authCloudImplicit() {
  // [START auth_cloud_implicit]
  // Imports the Google Cloud client library.
  const {Storage} = require('@google-cloud/storage');

  // Instantiates a client. If you don't specify credentials when constructing
  // the client, the client library will look for credentials in the
  // environment.
  const storage = new Storage();

  // Makes an authenticated API request.
  storage
    .getBuckets()
    .then(results => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach(bucket => {
        console.log(bucket.name);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END auth_cloud_implicit]
}

function authCloudExplicit() {
  // [START auth_cloud_explicit]
  // Imports the Google Cloud client library.
  const {Storage} = require('@google-cloud/storage');

  // Instantiates a client. Explicitly use service account credentials by
  // specifying the private key file. All clients in google-cloud-node have this
  // helper, see https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
  const storage = new Storage({
    projectId: 'project-id',
    keyFilename: '/path/to/keyfile.json',
  });

  // Makes an authenticated API request.
  storage
    .getBuckets()
    .then(results => {
      const buckets = results[0];

      console.log('Buckets:');
      buckets.forEach(bucket => {
        console.log(bucket.name);
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END auth_cloud_explicit]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `auth-cloud-implicit`,
    `Loads credentials implicitly.`,
    {},
    authCloudImplicit
  )
  .command(
    `auth-cloud-explicit`,
    `Loads credentials explicitly.`,
    {},
    authCloudExplicit
  )
  .example(`node $0 implicit`, `Loads credentials implicitly.`)
  .example(`node $0 explicit`, `Loads credentials explicitly.`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/docs/authentication`
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
