// Copyright 2019 Google LLC
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

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// [START secretmanager_get_secret]
/**
 * Get metadata about a secret.
 *
 * @param {string} projectId The ID of the Google Cloud project.
 * @param {string} secretId The ID of the secret to retrieve.
 */
async function getSecret(projectId, secretId) {
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretId}`;
  try {
    const [secret] = await client.getSecret({
      name: name,
    });

    if (secret.replication && secret.replication.replication) {
      const policy = secret.replication.replication;
      console.info(
        `Found secret ${secret.name} with replication policy ${policy}`
      );
    } else {
      console.info(`Found secret ${secret.name} with no replication policy.`);
    }
    return secret;
  } catch (err) {
    console.error(`Failed to retrieve secret ${name}:`, err);
  } finally {
    await client.close();
  }
}
// [END secretmanager_get_secret]

async function main() {
  const projectId = process.argv[2] || process.env.PROJECT_ID;
  const secretId = process.argv[3] || process.env.SECRET_ID;

  await getSecret(projectId, secretId);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err.message);
  });
}

module.exports.getSecret = getSecret;
