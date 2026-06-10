// Copyright 2026 Google LLC
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

async function main(parent, secretId, topicName) {
  // [START secretmanager_create_secret_with_rotation]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const parent = 'projects/my-project';
  // const secretId = 'my-rotating-secret';
  // const topicName = 'projects/my-project/topics/my-rotation-topic';

  // Import the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Create the Secret Manager client
  const client = new SecretManagerServiceClient();

  async function createSecretWithRotation() {
    // Set rotation period to 24 hours
    const rotationPeriodHours = 24;

    // Calculate next rotation time (24 hours from now)
    const nextRotationTime = new Date();
    nextRotationTime.setHours(nextRotationTime.getHours() + 24);

    // Create the secret with rotation configuration
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        replication: {
          automatic: {},
        },
        topics: [
          {
            name: topicName,
          },
        ],
        rotation: {
          nextRotationTime: {
            seconds: Math.floor(nextRotationTime.getTime() / 1000),
            nanos: (nextRotationTime.getTime() % 1000) * 1000000,
          },
          rotationPeriod: {
            seconds: rotationPeriodHours * 3600,
            nanos: 0,
          },
        },
      },
    });

    console.log(
      `Created secret ${secret.name} with rotation period ${rotationPeriodHours} hours and topic ${topicName}`
    );
  }

  createSecretWithRotation();
  // [END secretmanager_create_secret_with_rotation]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
