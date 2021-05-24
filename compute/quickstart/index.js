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

// [START compute_instances_list]
// [START compute_instances_list_all]
// [START compute_instances_create]
// [START compute_instances_delete]
// [START compute_instances_operation_check]

const compute = require('@google-cloud/compute');
const compute_protos = compute.protos.google.cloud.compute.v1;

// [END compute_instances_operation_check]
// [END compute_instances_delete]
// [END compute_instances_create]
// [END compute_instances_list_all]
// [END compute_instances_list]

// [START compute_instances_list]

/**
 * Gets a list of instances created in given project in given zone.
 * Returns an iterable collection of Instance objects.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @returns {InstanceList} - An iterable collection of Instance objects.
 */
async function listInstances(projectId, zone) {
  const client = new compute.InstancesClient({fallback: 'rest'});

  const [instanceList] = await client.list({
    project: projectId,
    zone,
  });

  console.log(`Instances found in zone ${zone}:`);

  for (const instance of instanceList.items) {
    console.log(` - ${instance.name} (${instance.machineType})`);
  }

  return instanceList;
}
// [END compute_instances_list]

// [START compute_instances_list_all]
/**
 * Returns a object of all instances present in a project, grouped by their zone.
 *
 * @typedef {Object} AllInstancesList
 * @property {string} zone
 * @property {Instance[]} instances
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @returns {AllInstancesList} - An object, where key is a zone, and value is an array of Instances
 */
async function listAllInstances(projectId) {
  const client = new compute.InstancesClient({fallback: 'rest'});
  const aggListRequest = await client.aggregatedList({
    project: projectId,
  });
  const aggList = aggListRequest[0].items;
  const allInstances = {};

  console.log('Instances found:');

  for (const zone in aggList) {
    if (aggList[zone].instances.length > 0) {
      allInstances[zone] = aggList[zone].instances;
      console.log(` ${zone}`);
      for (const instance of aggList[zone].instances) {
        console.log(` - ${instance.name} (${instance.machineType})`);
      }
    }
  }

  return allInstances;
}

// [END compute_instances_list_all]

// [START compute_instances_create]

/**
 * Sends an instance creation request to GCP and waits for it to complete.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} instanceName - Name of the new machine.
 * @param {string} machineType - Machine type you want to create in following format:
 *    "zones/{zone}/machineTypes/{type_name}". For example:
 *    "zones/europe-west3-c/machineTypes/f1-micro"
 *    You can find the list of available machine types using:
 *    https://cloud.google.com/sdk/gcloud/reference/compute/machine-types/list
 * @param {string} sourceImage - Path the the disk image you want to use for your boot
 *    disk. This can be one of the public images
 *    (e.g. "projects/debian-cloud/global/images/family/debian-10")
 *    or a private image you have access to.
 *    You can check the list of available public images using:
 *    $ gcloud compute images list
 * @param {string} networkName - Name of the network you want the new instance to use.
 *    For example: global/networks/default - if you want to use the default network.
 *
 * @returns {Instance} - Instance object.
 */
async function createInstance(
  projectId,
  zone,
  instanceName,
  machineType = 'n1-standard-1',
  sourceImage = 'projects/debian-cloud/global/images/family/debian-10',
  networkName = 'global/networks/default'
) {
  const instancesClient = new compute.InstancesClient({fallback: 'rest'});

  const attachedDisk = new compute_protos.AttachedDisk();
  const initializeParams = new compute_protos.AttachedDiskInitializeParams();

  initializeParams.diskSizeGb = '10';
  initializeParams.sourceImage = sourceImage;

  attachedDisk.initializeParams = initializeParams;
  attachedDisk.autoDelete = true;
  attachedDisk.boot = true;
  attachedDisk.type = compute_protos.AttachedDisk.Type.PERSISTENT;

  const networkInterface = new compute_protos.NetworkInterface();
  networkInterface.name = networkName;

  // Collecting all the information into the Instance object
  const instance = new compute_protos.Instance();
  instance.name = instanceName;
  instance.disks = [attachedDisk];
  instance.machineType = `zones/${zone}/machineTypes/${machineType}`;
  instance.networkInterfaces = [networkInterface];

  console.log(`Creating the ${instanceName} instance in ${zone}...`);

  const operation = await instancesClient.insert({
    instanceResource: instance,
    project: projectId,
    zone,
  });

  // Waiting the operation
  if (operation[0].status === compute_protos.Operation.Status.RUNNING) {
    const operationClient = new compute.ZoneOperationsClient({
      fallback: 'rest',
    });

    await operationClient.wait({
      operation: operation[0].name,
      project: projectId,
      zone,
    });
  }

  console.log(`Instance ${instanceName} created.`);

  return instance;
}
// [END compute_instances_create]

// [START compute_instances_delete]

/**
 * Sends a delete request to GCP and waits for it to complete.
 *
 * @param {string} projectId - ID or number of the project you want to use.
 * @param {string} zone - Name of the zone you want to check, for example: us-west3-b
 * @param {string} machineName - Name of the machine you want to delete.
 */
async function deleteInstance(projectId, zone, machineName) {
  const client = new compute.InstancesClient({fallback: 'rest'});

  console.log(`Deleting ${machineName} from ${zone}...`);

  const operation = await client.delete({
    project: projectId,
    zone,
    instance: machineName,
  });

  if (operation[0].status === compute_protos.Operation.Status.RUNNING) {
    const operationClient = new compute.ZoneOperationsClient({
      fallback: 'rest',
    });

    await operationClient.wait({
      operation: operation[0].name,
      project: projectId,
      zone,
    });
  }

  console.log(`Instance ${machineName} deleted.`);
}

// [END compute_instances_delete]

async function main(projectId, zone, instanceName) {
  await createInstance(projectId, zone, instanceName);

  const zoneInstances = await listInstances(projectId, zone);

  console.log(
    `Instances found in ${zone}: ${zoneInstances.items
      .map(i => i.name)
      .join(',')}`
  );

  const allInstances = await listAllInstances(projectId);
  console.log(`Instances found in project ${projectId}:`);

  for (const zoneInstance in allInstances) {
    console.log(
      `${zoneInstance}: ${allInstances[zoneInstance]
        .map(i => i.name)
        .join(',')}`
    );
  }

  await deleteInstance(projectId, zone, instanceName);
}

async function run() {
  const client = new compute.InstancesClient({fallback: 'rest'});
  const defaultProjectId = await client.getProjectId();
  const instanceZone = 'europe-central2-b';
  const instanceName = `test-${Math.random().toString(36).substring(5)}`;

  await main(defaultProjectId, instanceZone, instanceName);
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = {
  main,
  listInstances,
  listAllInstances,
  createInstance,
  deleteInstance,
};
