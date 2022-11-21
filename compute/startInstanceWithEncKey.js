// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Starts a stopped Google Compute Engine instance (with encrypted disks).
 *
 * @param {string} projectId - project ID or project number of the Cloud project your instance belongs to.
 * @param {string} zone - name of the zone your instance belongs to.
 * @param {string} instanceName - name of the instance your want to start.
 * @param {string} key - stringrepresenting a raw base64 encoded key to your machines boot disk.
 *    For more information about disk encryption see:
 *    https://cloud.google.com/compute/docs/disks/customer-supplied-encryption#specifications
 */
function main(projectId, zone, instanceName, key) {
  // [START compute_start_enc_instance]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b'
  // const instanceName = 'YOUR_INSTANCE_NAME'
  // const key = 'YOUR_KEY_STRING'

  const compute = require('@google-cloud/compute');

  async function startInstanceWithEncryptionKey() {
    const instancesClient = new compute.InstancesClient();

    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });

    const [response] = await instancesClient.startWithEncryptionKey({
      project: projectId,
      zone,
      instance: instanceName,
      instancesStartWithEncryptionKeyRequestResource: {
        disks: [
          {
            source: instance.disks[0].source,
            diskEncryptionKey: {
              rawKey: key,
            },
          },
        ],
      },
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Instance with encryption key started.');
  }

  startInstanceWithEncryptionKey();
  // [END compute_start_enc_instance]
}

main(...process.argv.slice(2));
