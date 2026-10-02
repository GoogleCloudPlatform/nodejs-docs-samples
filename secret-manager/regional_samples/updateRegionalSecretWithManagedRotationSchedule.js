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

  // Reconfigures the recurring rotation schedule on a secret that already
  // has Cloud SQL managed rotation enabled (see
  // enableRegionalSecretManagedRotation.js). This only applies to regional
  // secrets of the CLOUD_SQL_DB_CREDENTIALS type -- calling it on any other
  // secret type, or before managed rotation has been enabled, fails.
  //
  // rotationPeriodSeconds is the interval between rotations, in whole
  // seconds. The service requires it to be at least 3600 (1 hour), and the
  // derived nextRotationTime (now + rotationPeriodSeconds) must be at least
  // 300 seconds (5 minutes) in the future -- both are enforced by the API,
  // not checked client-side here.
  async function updateRegionalSecretWithManagedRotationSchedule() {
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
      // Mask only the two subfields being set here, not the whole
      // "rotation" submessage -- that would also include
      // managed_rotation_status, which is output-only and rejects a
      // whole-submessage replace with "immutable and cannot be updated"
      // (the same behavior confirmed against a live project in this same
      // port's Go samples; field mask paths reference the proto's
      // snake_case field names regardless of client language).
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
