// Copyright 2023 Google LLC
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

function main(projectId, zone, instanceName) {
  // [START compute_instances_create_with_local_ssd]
  // TODO(developer): Uncomment and replace these variables before running the sample.
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const instanceName = 'YOUR_INSTANCE_NAME';

  const compute = require('@google-cloud/compute');

  // Create a new VM instance with Debian 10 operating system and SSD local disk.
  async function createInstanceWithLocalSSD() {
    const diskSizeGb = 10;
    const boot = true;
    const autoDelete = true;
    const diskType = `zones/${zone}/diskTypes/pd-standard}`;
    const disks = [];

    // Get the latest debian image.
    // Retrieve the newest image that is part of a given family in a project.
    // Args:
    //    project: project ID or project number of the Cloud project you want to get image from.
    //    family: name of the image family you want to get image from.
    const imagesClient = new compute.ImagesClient();
    const [newestDebian] = await imagesClient.getFromFamily({
      project: 'debian-cloud',
      family: 'debian-11',
    });

    // Create the disks to be included in the instance.
    disks.push(
      createDiskFromImage(
        diskType,
        diskSizeGb,
        boot,
        newestDebian.selfLink,
        autoDelete
      )
    );
    disks.push(createLocalSsdDisk(zone));

    // Create the instance.
    const [instance] = await createInstance(
      projectId,
      zone,
      instanceName,
      disks
    );

    if (instance !== null) {
      console.log(`Instance created with local SSD: ${instance.name}`);
    }
  }

  // Create an AttachedDisk object to be used in VM instance creation. Uses an image as the
  // source for the new disk.
  //
  // Args:
  //    diskType: the type of disk you want to create. This value uses the following format:
  //        "zones/{zone}/diskTypes/(pd-standard|pd-ssd|pd-balanced|pd-extreme)".
  //        For example: "zones/us-west3-b/diskTypes/pd-ssd"
  //
  //    diskSizeGb: size of the new disk in gigabytes.
  //
  //    boot: boolean flag indicating whether this disk should be used as a
  //    boot disk of an instance.
  //
  //    sourceImage: source image to use when creating this disk.
  //    You must have read access to this disk. This can be one of the publicly available images
  //    or an image from one of your projects.
  //    This value uses the following format: "projects/{project_name}/global/images/{image_name}"
  //
  //    autoDelete: boolean flag indicating whether this disk should be deleted
  //    with the VM that uses it.
  function createDiskFromImage(
    diskType,
    diskSizeGb,
    boot,
    sourceImage,
    autoDelete
  ) {
    return {
      initializeParams: {
        sourceImage: sourceImage,
        diskSizeGb: diskSizeGb,
      },
      // Remember to set autoDelete to True if you want the disk to be deleted when you delete
      // your VM instance.
      autoDelete: autoDelete,
      boot: boot,
      diskType: diskType,
    };
  }

  // Create an AttachedDisk object to be used in VM instance creation. The created disk contains
  // no data and requires formatting before it can be used.
  // Args:
  //    zone: The zone in which the local SSD drive will be attached.
  function createLocalSsdDisk(zone) {
    return {
      type: 'SCRATCH',
      autoDelete: true,
      initializeParams: {
        diskType: `zones/${zone}/diskTypes/local-ssd`,
      },
    };
  }

  // Send an instance creation request to the Compute Engine API and wait for it to complete.
  // Args:
  //    projectId: project ID or project number of the Cloud project you want to use.
  //    zone: name of the zone to create the instance in. For example: "us-west3-b"
  //    instanceName: name of the new virtual machine (VM) instance.
  //    disks: a list of compute.v1.AttachedDisk objects describing the disks
  //           you want to attach to your new instance.
  async function createInstance(projectId, zone, instanceName, disks) {
    // Instantiates a reusable client object.
    // (Node.js will automatically clean it up.)
    const instancesClient = new compute.InstancesClient();

    // machineType: machine type of the VM being created. This value uses the
    // following format: "zones/{zone}/machineTypes/{type_name}".
    // For example: "zones/europe-west3-c/machineTypes/f1-micro"
    const typeName = 'n1-standard-1';
    const machineType = `zones/${zone}/machineTypes/${typeName}`;
    // networkLink: name of the network you want the new instance to use.
    // For example: "global/networks/default" represents the network
    // named "default", which is created automatically for each project.
    const networkLink = 'global/networks/default';

    // Collect information into the Instance object.
    const [response] = await instancesClient.insert({
      project: projectId,
      zone: zone,
      instanceResource: {
        name: instanceName,
        machineType: machineType,
        networkInterfaces: [
          {
            name: networkLink,
          },
        ],
        disks: disks,
      },
    });

    let operation = response.latestResponse;
    const operationsClient = new compute.ZoneOperationsClient();

    // Wait for the create operation to complete.
    while (operation.status !== 'DONE') {
      [operation] = await operationsClient.wait({
        operation: operation.name,
        project: projectId,
        zone: operation.zone.split('/').pop(),
      });
    }

    return instancesClient.get({
      project: projectId,
      zone: zone,
      instance: instanceName,
    });
  }

  createInstanceWithLocalSSD();
  // [END compute_instances_create_with_local_ssd]
}

main(...process.argv.slice(2));
