// Copyright 2022 Google LLC
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
 * Sets the autodelete flag of a disk to given value.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you want to use.
 * @param {string} zone - Name of the zone in which is the disk you want to modify.
 * @param {string} instanceName - Name of the instance the disk is attached to.
 * @param {string} diskName - The name of the disk which flag you want to modify.
 * @param {boolean} autoDelete - The new value of the autodelete flag.
 */
function main(projectId, zone, instanceName, diskName, autoDelete) {
  // [START compute_disk_autodelete_change]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';
  // const diskName = 'YOUR_DISK_NAME';
  // const autoDelete = true;

  const compute = require('@google-cloud/compute');

  async function setDiskAutodelete() {
    const instancesClient = new compute.InstancesClient();

    const [instance] = await instancesClient.get({
      project: projectId,
      zone,
      instance: instanceName,
    });

    if (!instance.disks.some(disk => disk.deviceName === diskName)) {
      throw new Error(
        `Instance ${instanceName} doesn't have a disk named ${diskName} attached.`
      );
    }

    const [response] = await instancesClient.setDiskAutoDelete({
      project: projectId,
      zone,
      instance: instanceName,
      deviceName: diskName,
      autoDelete,
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the update instance operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    console.log('Disk autoDelete field updated.');
  }

  setDiskAutodelete();
  // [END compute_disk_autodelete_change]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[4] = args[4] === 'true';
main(...args);
