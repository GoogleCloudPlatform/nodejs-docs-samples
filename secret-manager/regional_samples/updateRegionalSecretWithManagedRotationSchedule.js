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

async function main(projectId, locationId, secretId, rotationPeriodSeconds) {
  // [START secretmanager_update_regional_secret_with_managed_rotation_schedule]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const locationId = 'my-location';
  // const secretId = 'my-secret';
  // const rotationPeriodSeconds = 24 * 60 * 60; // 24 hours

  const name = `projects/${projectId}/locations/${locationId}/secrets/${secretId}`;

  // Imports the Secret Manager library
  const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

  // Adding the endpoint to call the regional secret manager sever
  const options = {};
  options.apiEndpoint = `secretmanager.${locationId}.rep.googleapis.com`;

  // Instantiates a client
  const client = new SecretManagerServiceClient(options);

  // Updates the rotation schedule of a CLOUD_SQL_DB_CREDENTIALS typed secret.
  async function updateRegionalSecretWithManagedRotationSchedule() {
    // The rotation schedule of a CLOUD_SQL_DB_CREDENTIALS secret can be set
    // before or after enabling managed rotation; EnableManagedRotation does not
    // need to be called first. Other secret types also support a rotation
    // schedule, but only when Pub/Sub topics are configured. Pub/Sub topics are
    // not required for CLOUD_SQL_DB_CREDENTIALS.
    const nowSeconds = Math.floor(Date.now() / 1000);

    const [secret] = await client.updateSecret({
      secret: {
        name: name,
        rotation: {
          nextRotationTime: {
            seconds: nowSeconds + Number(rotationPeriodSeconds),
          },
          rotationPeriod: {
            seconds: Number(rotationPeriodSeconds),
          },
        },
      },
      // Mask only the rotation subfields being set, not the whole rotation
      // submessage.
      updateMask: {
        paths: ['rotation.next_rotation_time', 'rotation.rotation_period'],
      },
    });

    console.log(`Updated regional secret rotation schedule: ${secret.name}`);
  }

  updateRegionalSecretWithManagedRotationSchedule();
  // [END secretmanager_update_regional_secret_with_managed_rotation_schedule]
}

const args = process.argv.slice(2);
main(...args).catch(console.error);
