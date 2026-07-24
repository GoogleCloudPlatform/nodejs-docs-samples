// Copyright 2023 Google LLC
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

async function main(projectId, secretId, locationId, topicName) {
  // [START secretmanager_create_regional_secret_with_topic]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const secretId = 'my-secret-with-topic';
  // const locationId = 'us-central1';
  // const topicName = 'projects/my-project/topics/my-topic';

  // Build the resource name of the parent project with location
  const parent = `projects/${projectId}/locations/${locationId}`;

  // Import the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager server
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiate a client with the regional endpoint
  const client = new SecretManagerServiceClient(options);

  async function createRegionalSecretWithTopic() {
    // Create the secret with a topic for notifications
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        topics: [
          {
            name: topicName,
          },
        ],
      },
    });

    console.log(`Created secret ${secret.name} with topic ${topicName}`);
  }

  createRegionalSecretWithTopic();
  // [END secretmanager_create_regional_secret_with_topic]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
