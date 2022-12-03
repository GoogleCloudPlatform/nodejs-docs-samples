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
 * Creates a new Windows image from the specified source disk.
 *
 * @param {string} projectId - Project ID or project number of the Cloud project you use.
 * @param {string} zone - Zone of the disk you copy from.
 * @param {string} sourceDiskName - Name of the source disk you copy from.
 * @param {string} imageName - Name of the image you want to create.
 * @param {string} storageLocation - Storage location for the image. If the value is undefined, function will store the image in the multi-region closest to your image's source location.
 * @param {boolean} forceCreate - Create the image even if the source disk is attached to a running instance.
 */
function main(
  projectId,
  zone,
  sourceDiskName,
  imageName,
  storageLocation,
  forceCreate = false
) {
  // [START compute_windows_image_create]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const sourceDiskName = 'YOUR_SOURCE_DISK_NAME';
  // const imageName = 'YOUR_IMAGE_NAME';
  // const storageLocation = 'eu';
  // const forceCreate = false;

  const compute = require('@google-cloud/compute');

  function parseInstanceName(name) {
    const parsedName = name.split('/');
    const l = parsedName.length;

    if (parsedName.legth < 5) {
      throw new Error(
        'Provide correct instance name in the following format: https://www.googleapis.com/compute/v1/projects/PROJECT/zones/ZONE/instances/INSTANCE_NAME'
      );
    }

    return [parsedName[l - 1], parsedName[l - 3], parsedName[l - 5]];
  }

  async function createWindowsOSImage() {
    const imagesClient = new compute.ImagesClient();
    const instancesClient = new compute.InstancesClient();
    const disksClient = new compute.DisksClient();

    // Getting instances where source disk is attached
    const [sourceDisk] = await disksClient.get({
      project: projectId,
      zone,
      disk: sourceDiskName,
    });

    // Сhecking whether the instances is stopped
    for (const fullInstanceName of sourceDisk.users) {
      const [instanceName, instanceZone, instanceProjectId] =
        parseInstanceName(fullInstanceName);
      const [instance] = await instancesClient.get({
        project: instanceProjectId,
        zone: instanceZone,
        instance: instanceName,
      });

      if (
        !['TERMINATED', 'STOPPED'].includes(instance.status) &&
        !forceCreate
      ) {
        throw new Error(
          `Instance ${instanceName} should be stopped. Please stop the instance using GCESysprep command or set forceCreate parameter to true (not recommended). More information here: https://cloud.google.com/compute/docs/instances/windows/creating-windows-os-image#api.`
        );
      }
    }

    if (forceCreate) {
      console.warn(
        'Warning: forceCreate option compromise the integrity of your image. Stop the instance before you create the image if possible.'
      );
    }

    const [response] = await imagesClient.insert({
      project: projectId,
      forceCreate,
      imageResource: {
        name: imageName,
        sourceDisk: `/zones/${zone}/disks/${sourceDiskName}`,
        storageLocations: storageLocation ? [storageLocation] : [],
      },
    });
    let operation = response.latestResponse;
    const operationsClient = new compute.GlobalOperationsClient();

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
      });
    }

    console.log('Image created.');
  }

  createWindowsOSImage();
  // [END compute_windows_image_create]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
if (args.length >= 6) {
  args[7] = args[7] === 'true';
}

main(...args);
