// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(parent, secretId, annotationKey, annotationValue) {
  // [START secretmanager_create_secret_with_annotations]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-secret';
  // const annotationKey = 'exampleannotationkey';
  // const annotationValue = 'exampleannotationvalue';

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Instantiates a client
  const client = new SecretManagerServiceClient();

  async function createSecretWithAnnotations() {
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
        annotations: {
          [annotationKey]: annotationValue,
        },
      },
    });

    console.log(`Created secret ${secret.name}`);
  }

  createSecretWithAnnotations();
  // [END secretmanager_create_secret_with_annotations]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
