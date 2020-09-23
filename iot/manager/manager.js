// Copyright 2017 Google LLC
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

/* eslint-disable prefer-destructuring */

'use strict';

const fs = require('fs');

// [START iot_get_client]
const {google} = require('googleapis');
const iot = require('@google-cloud/iot');

const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

const client = new iot.v1.DeviceManagerClient();
// [END iot_get_client]

if (client === undefined) {
  console.log('Did not instantiate client.');
}

// Configures the topic for Cloud IoT Core.
const setupIotTopic = async (topicName) => {
  const {PubSub} = require('@google-cloud/pubsub');

  const pubsub = new PubSub();
  const topic = pubsub.topic(topicName);
  const serviceAccount = `serviceAccount:cloud-iot@system.gserviceaccount.com`;

  let policy = await topic.iam.getPolicy();
  policy = policy[0] || {};

  policy.bindings || (policy.bindings = []);
  console.log(JSON.stringify(policy, null, 2));

  let hasRole = false;
  let binding = {
    role: 'roles/pubsub.publisher',
    members: [serviceAccount],
  };

  policy.bindings.forEach((_binding) => {
    if (_binding.role === binding.role) {
      binding = _binding;
      hasRole = true;
      return false;
    }
  });

  if (hasRole) {
    binding.members || (binding.members = []);
    if (binding.members.indexOf(serviceAccount) === -1) {
      binding.members.push(serviceAccount);
    }
  } else {
    policy.bindings.push(binding);
  }

  // Updates the IAM policy for the topic
  try {
    const [updatedPolicy] = await topic.iam.setPolicy(policy);
    console.log(JSON.stringify(updatedPolicy, null, 2));
  } catch (err) {
    console.error('Error updating policy:', err);
  }
};

const createIotTopic = async (topicName) => {
  // Imports the Google Cloud client library
  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates a client
  const pubsub = new PubSub();

  await pubsub.createTopic(topicName);
  await setupIotTopic(topicName);
};

// Lookup the registry, assuming that it exists.
const lookupRegistry = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_lookup_registry]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  try {
    const registryName = iotClient.registryPath(
      projectId,
      cloudRegion,
      registryId
    );
    try {
      const responses = await iotClient.getDeviceRegistry({name: registryName});
      const response = responses[0];
      console.log(response);
    } catch (err) {
      console.error('Error getting registry', err);
    }
  } catch (err) {
    console.error('Could not look up registry', err);
  }
  // [END iot_lookup_registry]
};

const createRegistry = async (
  client,
  registryId,
  projectId,
  cloudRegion,
  pubsubTopicId
) => {
  // [START iot_create_registry]
  // Client retrieved in callback
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // function errCb = lookupRegistry; // Lookup registry if already exists.
  const iot = require('@google-cloud/iot');

  // Lookup the pubsub topic
  const topicPath = `projects/${projectId}/topics/${pubsubTopicId}`;

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const newParent = iotClient.locationPath(projectId, cloudRegion);
  const deviceRegistry = {
    eventNotificationConfigs: [
      {
        pubsubTopicName: topicPath,
      },
    ],
    id: registryId,
  };
  const request = {
    parent: newParent,
    deviceRegistry: deviceRegistry,
  };

  try {
    const responses = await iotClient.createDeviceRegistry(request);
    const response = responses[0];

    console.log('Successfully created registry');
    console.log(response);
  } catch (err) {
    console.error('Could not create registry', err);
  }
  // [END iot_create_registry]
};

// Create a new device with a given public key format
const createDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  publicKeyFormat,
  publicKeyFile
) => {
  // [START iot_create_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);
  const device = {
    id: deviceId,
    credentials: [
      {
        publicKey: {
          format: publicKeyFormat,
          key: fs.readFileSync(publicKeyFile).toString(),
        },
      },
    ],
  };

  const request = {
    parent: regPath,
    device,
  };
  try {
    const responses = await iotClient.createDevice(request);
    const response = responses[0];
    console.log('Created device', response);
  } catch (err) {
    console.error('Could not create device', err);
  }
  // [END iot_create_device]
};

// Create a new device with the given id. The body defines the parameters for
// the device, such as authentication.
const createUnauthDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) => {
  // [START iot_create_unauth_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);
  const device = {id: deviceId};
  const request = {
    parent: regPath,
    device,
  };

  try {
    const responses = await iotClient.createDevice(request);
    const response = responses[0];
    console.log('Created device', response);
  } catch (err) {
    console.error('Could not create device', err);
  }
  // [END iot_create_unauth_device]
};

// Create a device using RSA256 for authentication.
const createRsaDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  rsaCertificateFile
) => {
  // [START iot_create_rsa_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-rsa-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);
  const device = {
    id: deviceId,
    credentials: [
      {
        publicKey: {
          format: 'RSA_X509_PEM',
          key: fs.readFileSync(rsaCertificateFile).toString(),
        },
      },
    ],
  };

  const request = {
    parent: regPath,
    device,
  };

  try {
    const responses = await iotClient.createDevice(request);
    const response = responses[0];
    console.log('Created device', response);
  } catch (err) {
    console.error('Could not create device', err);
  }
  // [END iot_create_rsa_device]
};

// Create a device using ES256 for authentication.
const createEsDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  esCertificateFile
) => {
  // [START iot_create_es_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-es-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);
  const device = {
    id: deviceId,
    credentials: [
      {
        publicKey: {
          format: 'ES256_PEM',
          key: fs.readFileSync(esCertificateFile).toString(),
        },
      },
    ],
  };
  const request = {
    parent: regPath,
    device,
  };

  try {
    const responses = await iotClient.createDevice(request);
    const response = responses[0];
    console.log('Created device', response);
  } catch (err) {
    console.error('Could not create device', err);
  }
  // [END iot_create_es_device]
};

// Add RSA256 authentication to the given device.
const patchRsa256ForAuth = async (
  client,
  deviceId,
  registryId,
  rsaPublicKeyFile,
  projectId,
  cloudRegion
) => {
  // [START iot_patch_rsa]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-rsa-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const devPath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  const device = {
    name: devPath,
    credentials: [
      {
        publicKey: {
          format: 'RSA_X509_PEM',
          key: fs.readFileSync(rsaPublicKeyFile).toString(),
        },
      },
    ],
  };

  try {
    const responses = await iotClient.updateDevice({
      device: device,
      updateMask: {paths: ['credentials']},
    });

    console.log('Patched device:', deviceId);
    console.log('Response', responses[0]);
  } catch (err) {
    console.error('Error patching device:', deviceId, err);
  }
  // [END iot_patch_rsa]
};

// Add ES256 authentication to the given device.
const patchEs256ForAuth = async (
  client,
  deviceId,
  registryId,
  esPublicKeyFile,
  projectId,
  cloudRegion
) => {
  // [START iot_patch_es]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-es-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const devPath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  const device = {
    name: devPath,
    credentials: [
      {
        publicKey: {
          format: 'ES256_PEM',
          key: fs.readFileSync(esPublicKeyFile).toString(),
        },
      },
    ],
  };

  try {
    const responses = await iotClient.updateDevice({
      device: device,
      updateMask: {paths: ['credentials']},
    });

    console.log('Patched device:', deviceId);
    console.log('Response', responses[0]);
  } catch (err) {
    console.error('Error patching device:', deviceId, err);
  }
  // [END iot_patch_es]
};

// List all of the devices in the given registry.
const listDevices = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_list_devices]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const parentName = iotClient.registryPath(projectId, cloudRegion, registryId);

  try {
    const responses = await iotClient.listDevices({parent: parentName});
    const devices = responses[0];

    if (devices.length > 0) {
      console.log('Current devices in registry:');
    } else {
      console.log('No devices in registry.');
    }

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      console.log(`Device ${i}: `, device);
    }
  } catch (err) {
    console.error('Could not list devices', err);
  }
  // [END iot_list_devices]
};

// List all of the registries in the given project.
const listRegistries = async (client, projectId, cloudRegion) => {
  // [START iot_list_registries]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  const iot = require('@google-cloud/iot');

  const newClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  // Iterate over all elements.
  const formattedParent = newClient.locationPath(projectId, cloudRegion);

  try {
    const responses = await newClient.listDeviceRegistries({
      parent: formattedParent,
    });
    const resources = responses[0];
    console.log('Current registries in project:\n', resources);
  } catch (err) {
    console.error('Could not list registries', err);
  }
  // [END iot_list_registries]
};

// Delete the given device from the registry.
const deleteDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) => {
  // [START iot_delete_device]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const devPath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );
  try {
    const responses = await iotClient.deleteDevice({name: devPath});
    console.log('Successfully deleted device', responses);
  } catch (err) {
    console.error('Could not delete device', err);
  }
  // [END iot_delete_device]
};

// Clear the given registry by removing all devices and deleting the registry.
const clearRegistry = async (client, registryId, projectId, cloudRegion) => {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const requestDelete = {
    name: registryName,
  };

  const request = {
    parent: registryName,
  };

  let devices;
  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    devices = data.devices;
  } catch (err) {
    console.error('Could not list devices', err);
    return;
  }

  // Delete devices in registry
  console.log('Current devices in registry:', devices);
  if (devices) {
    const promises = devices.map((device, index) => {
      console.log(`${device.id} [${index}/${devices.length}] removed`);
      return deleteDevice(
        client,
        device.id,
        registryId,
        projectId,
        cloudRegion
      );
    });
    await Promise.all(promises);
  }

  // Delete registry
  try {
    const {data} = await client.projects.locations.registries.delete(
      requestDelete
    );

    console.log(`Successfully deleted registry ${registryName}`);
    console.log(data);
  } catch (err) {
    console.error('Could not delete registry', err);
  }
};

// Delete the given registry. Note that this will only succeed if the registry
// is empty.
const deleteRegistry = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_delete_registry]
  // Client retrieved in callback
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';

  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const registryName = iotClient.registryPath(
    projectId,
    cloudRegion,
    registryId
  );
  try {
    const responses = await iotClient.deleteDeviceRegistry({
      name: registryName,
    });
    console.log(responses);
    console.log('Successfully deleted registry');
  } catch (err) {
    console.error('Could not delete registry', err);
  }
  // [END iot_delete_registry]
};

// Retrieve the given device from the registry.
const getDevice = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) => {
  // [START iot_get_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });
  const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  try {
    const responses = await iotClient.getDevice({name: devicePath});
    const data = responses[0];

    console.log('Found device:', deviceId, data);
  } catch (err) {
    console.error('Could not find device:', deviceId);
    console.error('Trace:', err);
  }
  // [END iot_get_device]
};

// Retrieve the given device's state from the registry.
const getDeviceState = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) => {
  // [START iot_get_device_state]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });
  const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  try {
    const responses = await iotClient.listDeviceStates({name: devicePath});
    const states = responses[0].deviceStates;
    if (states.length === 0) {
      console.log(`No States for device: ${deviceId}`);
    } else {
      console.log(`States for device: ${deviceId}`);
    }

    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      console.log(
        'State:',
        state,
        '\nData:\n',
        state.binaryData.toString('utf8')
      );
    }
  } catch (err) {
    console.error('Could not find device:', deviceId);
    console.error('trace:', err);
  }
  // [END iot_get_device_state]
};

// Retrieve the given device's configuration history from the registry.
const getDeviceConfigs = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) => {
  // [START iot_get_device_configs]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });
  const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  try {
    const responses = await iotClient.listDeviceConfigVersions({
      name: devicePath,
    });
    const configs = responses[0].deviceConfigs;

    if (configs.length === 0) {
      console.log(`No configs for device: ${deviceId}`);
    } else {
      console.log(`Configs:`);
    }

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(
        'Config:',
        config,
        '\nData:\n',
        config.binaryData.toString('utf8')
      );
    }
  } catch (err) {
    console.error('Could not find device:', deviceId);
    console.error('trace:', err);
  }
  // [END iot_get_device_configs]
};

// Send configuration data to device.
const setDeviceConfig = async (
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  data,
  version
) => {
  // [START iot_set_device_config]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // const data = 'test-data';
  // const version = 0;
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const formattedName = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  const binaryData = Buffer.from(data).toString('base64');
  const request = {
    name: formattedName,
    versionToUpdate: version,
    binaryData: binaryData,
  };

  try {
    const responses = await iotClient.modifyCloudToDeviceConfig(request);

    console.log('Success:', responses[0]);
  } catch (err) {
    console.error('Could not update config:', deviceId);
    console.error('Message:', err);
  }
  // [END iot_set_device_config]
};

// sends a command to a specified device subscribed to the commands topic
const sendCommand = async (
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  commandMessage
) => {
  // [START iot_send_command]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const commandMessage = 'message for device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const formattedName = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );
  const binaryData = Buffer.from(commandMessage);
  const request = {
    name: formattedName,
    binaryData: binaryData,
  };

  try {
    const responses = await iotClient.sendCommandToDevice(request);
    
    console.log('Sent command: ', responses[0]);
  } catch (err) {
    console.error('Could not send command:', err);
  }
  // [END iot_send_command]
};

// Retrieve the given device from the registry.
const getRegistry = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_get_registry]
  // Client retrieved in callback
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  try {
    const registryName = iotClient.registryPath(
      projectId,
      cloudRegion,
      registryId
    );
    try {
      const responses = await iotClient.getDeviceRegistry({name: registryName});
      const response = responses[0];

      console.log('Found registry:', registryId);
      console.log(response);
    } catch (err) {
      console.error('Could not get device registry', err);
    }
  } catch (err) {
    console.error('Could not find registry:', registryId);
    console.error('Trace:', err);
  }
  // [END iot_get_registry]
};

// Returns an authorized API client by discovering the Cloud IoT Core API with
// the provided API key.
const getClient = async (serviceAccountJson) => {
  // the getClient method looks for the GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
  // environment variables if serviceAccountJson is not passed in
  const authClient = await google.auth.getClient({
    keyFilename: serviceAccountJson,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

  google.options({
    auth: authClient,
  });

  try {
    return google.discoverAPI(discoveryUrl);
  } catch (err) {
    console.error('Error during API discovery.', err);
  }
};

// Retrieves the IAM policy for a given registry.
const getIamPolicy = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_get_iam_policy]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const formattedResource = iotClient.registryPath(
    projectId,
    cloudRegion,
    registryId
  );

  let bindings, etag;
  try {
    const responses = await iotClient.getIamPolicy({
      resource: formattedResource,
    });
    const response = responses[0];

    bindings = response.bindings;
    etag = response.etag;

    console.log('ETAG:', etag);
    bindings = bindings || [];

    bindings.forEach((_binding) => {
      console.log(`Role: ${_binding.role}`);
      _binding.members || (_binding.members = []);
      _binding.members.forEach((_member) => {
        console.log(`\t${_member}`);
      });
    });
  } catch (err) {
    console.error('Could not find policy for: ', registryId);
    console.error('Trace: ', err);
  }

  // [END iot_get_iam_policy]
};

// Sets the IAM permissions for a given registry to a single member / role.
const setIamPolicy = async (
  client,
  registryId,
  projectId,
  cloudRegion,
  member,
  role
) => {
  // [START iot_set_iam_policy]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';

  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const resource = iotClient.registryPath(projectId, cloudRegion, registryId);

  const policy = {
    bindings: [
      {
        members: [member],
        role: role,
      },
    ],
  };

  const request = {
    resource: resource,
    policy: policy,
  };

  let bindings, etag;
  try {
    const responses = await iotClient.setIamPolicy(request);
    const response = responses[0];

    bindings = response.bindings;
    etag = response.etag;

    console.log('ETAG:', etag);
    bindings = bindings || [];

    bindings.forEach((_binding) => {
      console.log(`Role: ${_binding.role}`);
      _binding.members || (_binding.members = []);
      _binding.members.forEach((_member) => {
        console.log(`\t${_member}`);
      });
    });
  } catch (err) {
    console.error('Could not set policy for: ', registryId);
    console.error('Trace: ', err);
  }
  // [END iot_set_iam_policy]
};

// Creates a gateway.
const createGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId,
  publicKeyFormat,
  publicKeyFile,
  gatewayAuthMethod
) => {
  // [START iot_create_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // const gatewayAuthMethod = 'ASSOCIATION_ONLY';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);

  console.log('Creating gateway:', gatewayId);

  let credentials = [];

  // if public key format and path are specified, use those
  if (publicKeyFormat && publicKeyFile) {
    credentials = [
      {
        publicKey: {
          format: publicKeyFormat,
          key: fs.readFileSync(publicKeyFile).toString(),
        },
      },
    ];
  }

  const device = {
    id: gatewayId,
    credentials: credentials,
    gatewayConfig: {
      gatewayType: 'GATEWAY',
      gatewayAuthMethod: gatewayAuthMethod,
    },
  };

  const request = {
    parent: regPath,
    device,
  };

  try {
    const responses = await iotClient.createDevice(request);
    const response = responses[0];
    console.log('Created device:', response);
  } catch (err) {
    console.error('Could not create gateway', err);
  }
  // [END iot_create_gateway]
};

// Binds a device to a gateway so that it can be attached.
const bindDeviceToGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId,
  gatewayId
) => {
  // [START iot_bind_device_to_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');

  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);

  const bindRequest = {
    parent: regPath,
    deviceId: deviceId,
    gatewayId: gatewayId,
  };

  console.log(`Binding device: ${deviceId}`);

  try {
    await iotClient.bindDeviceToGateway(bindRequest);

    console.log(`Bound ${deviceId} to`, gatewayId);
  } catch (err) {
    console.error('Could not bind device', err);
  }
  // [END iot_bind_device_to_gateway]
};

// Unbinds a device from a gateway.
const unbindDeviceFromGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId,
  gatewayId
) => {
  // [START iot_unbind_device_to_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';

  console.log(`Unbinding device: ${deviceId}`);

  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });
  const regPath = iotClient.registryPath(projectId, cloudRegion, registryId);

  const unbindRequest = {
    parent: regPath,
    deviceId: deviceId,
    gatewayId: gatewayId,
  };

  try {
    await iotClient.unbindDeviceFromGateway(unbindRequest);

    console.log(`Unbound ${deviceId} from`, gatewayId);
  } catch (err) {
    console.error('Could not unbind device', err);
  }
  // [END iot_unbind_device_to_gateway]
};

// Unbinds the given device from all gateways
const unbindDeviceFromAllGateways = async (
  projectId,
  cloudRegion,
  registryId,
  deviceId
) => {
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({});

  let device;
  const devicePath = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );
  try {
    const responses = await iotClient.getDevice({name: devicePath});
    device = responses[0];
    console.log(`Found Device ${device.id}`);
  } catch (err) {
    console.error('Could not find device:', deviceId);
    console.error('Trace:', err);
    return;
  }

  if (device) {
    try {
      const parentName = iotClient.registryPath(
        projectId,
        cloudRegion,
        registryId
      );
      const responses = await iotClient.listDevices({
        parent: parentName,
        gatewayListOptions: {associationsDeviceId: deviceId},
      });
      const gateways = responses[0];
      if (gateways && gateways.length > 0) {
        for (let i = 0; i < gateways.length; i++) {
          const gatewayId = gateways[i].id;
          unbindDeviceFromGateway(
            client,
            projectId,
            cloudRegion,
            registryId,
            deviceId,
            gatewayId
          );
        }
      }
    } catch (err) {
      console.error('Could not list gateways', err);
      return;
    }
  }
};

const unbindAllDevices = async (projectId, cloudRegion, registryId) => {
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const parentName = iotClient.registryPath(projectId, cloudRegion, registryId);

  try {
    const responses = await iotClient.listDevices({parent: parentName});
    const devices = responses[0];

    if (devices.length > 0) {
      console.log('Current devices in registry:');
    } else {
      console.log('No devices in registry.');
    }

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      unbindDeviceFromAllGateways(
        projectId,
        cloudRegion,
        registryId,
        device.id
      );
    }
  } catch (err) {
    console.error('Could not list devices', err);
  }
};

// Lists gateways in a registry.
const listGateways = async (client, projectId, cloudRegion, registryId) => {
  // [START iot_list_gateways]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const registryPath = iotClient.registryPath(
    projectId,
    cloudRegion,
    registryId
  );

  try {
    console.log('Current gateways in registry:');
    const responses = await iotClient.listDevices({
      parent: registryPath,
      fieldMask: {paths: ['config', 'gateway_config']},
    });
    const devices = responses[0];

    devices.forEach((device) => {
      if (
        device.gatewayConfig !== undefined &&
        device.gatewayConfig.gatewayType === 'GATEWAY'
      ) {
        console.log('----\n', device);
      }
    });
  } catch (err) {
    console.error('Could not list gateways:');
    console.error('Trace:', err);
    return;
  }
  // [END iot_list_gateways]
};

// Lists devices bound to a gateway.
const listDevicesForGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId
) => {
  // [START iot_list_devices_for_gateway]
  // const cloudRegion = 'us-central1';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const parentName = iotClient.registryPath(projectId, cloudRegion, registryId);

  try {
    const responses = await iotClient.listDevices({
      parent: parentName,
      gatewayListOptions: {associationsGatewayId: gatewayId},
    });
    const devices = responses[0];

    if (devices.length > 0) {
      console.log('Current devices bound to gateway: ', gatewayId);
    } else {
      console.log('No devices bound to this gateway.');
    }

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      console.log(`\tDevice: ${device.numId}: ${device.id}`);
    }
  } catch (err) {
    console.error('Could not list devices', err);
  }
  // [END iot_list_devices_for_gateway]
};

// Lists gateways a given device is bound to.
const listGatewaysForDevice = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) => {
  // [START iot_list_gateways_for_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const iot = require('@google-cloud/iot');
  const iotClient = new iot.v1.DeviceManagerClient({
    // optional auth parameters.
  });

  const parentName = iotClient.registryPath(projectId, cloudRegion, registryId);

  try {
    const responses = await iotClient.listDevices({
      parent: parentName,
      gatewayListOptions: {associationsDeviceId: deviceId},
    });
    const devices = responses[0];

    if (devices.length > 0) {
      console.log('Current gateways for: ', deviceId);
    } else {
      console.log('No gateways associated with this device.');
    }

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      console.log(`\tDevice: ${device.numId}: ${device.id}`);
    }
  } catch (err) {
    console.error('Could not list devices', err);
  }
  // [END iot_list_gateways_for_device]
};

require(`yargs`) // eslint-disable-line
  .demand(1)
  .options({
    cloudRegion: {
      alias: 'c',
      default: 'us-central1',
      requiresArg: true,
      type: 'string',
    },
    projectId: {
      alias: 'p',
      default: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
    serviceAccount: {
      alias: 's',
      default: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      description: 'The path to your service credentials JSON.',
      requiresArg: true,
      type: 'string',
    },
  })
  .command(
    `createRsa256Device <deviceId> <registryId> <rsaPath>`,
    `Creates an RSA256 device.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createRsaDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.rsaPath
      );
    }
  )
  .command(
    `createEs256Device <deviceId> <registryId> <esPath>`,
    `Creates an ES256 device.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createEsDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.esPath
      );
    }
  )
  .command(
    `createUnauthDevice <deviceId> <registryId>`,
    `Creates a device without authorization.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createUnauthDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `createDevice <deviceId> <registryId>`,
    `Creates a device with the given public key. Public key can be ommitted and added later on.`,
    {
      publicKeyFormat: {
        default: 'RSA_X509_PEM',
        description: 'Public key format for devices.',
        requiresArg: true,
        choices: ['RSA_PEM', 'RSA_X509_PEM', 'ES256_PEM', 'ES256_X509_PEM'],
        type: 'string',
      },
      publicKeyFile: {
        description:
          'Path to the public key file used for device authentication.',
        requiresArg: true,
        type: 'string',
      },
    },
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.publicKeyFormat,
        opts.publicKeyFile
      );
    }
  )
  .command(
    `createRegistry <registryId> <pubsubTopic>`,
    `Creates a device registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createRegistry(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.pubsubTopic
      );
    }
  )
  .command(
    `lookupRegistry <registryId>`,
    `Gets a device registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await lookupRegistry(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `createIotTopic <pubsubTopic>`,
    `Creates and configures a PubSub topic for Cloud IoT Core.`,
    {},
    (opts) => createIotTopic(opts.pubsubTopic)
  )
  .command(
    `setupIotTopic <pubsubTopic>`,
    `Configures the PubSub topic for Cloud IoT Core.`,
    {},
    (opts) => setupIotTopic(opts.pubsubTopic)
  )
  .command(
    `deleteDevice <deviceId> <registryId>`,
    `Deletes a device from the device registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await deleteDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `clearRegistry <registryId>`,
    `!!Be careful! Removes all devices and then deletes a device registry!!`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await clearRegistry(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `deleteRegistry <registryId>`,
    `Deletes a device registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await deleteRegistry(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `getDevice <deviceId> <registryId>`,
    `Retrieves device info given a device ID.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await getDevice(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `getDeviceConfigs <deviceId> <registryId>`,
    `Retrieves device configurations given a device ID.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      getDeviceConfigs(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `getDeviceState <deviceId> <registryId>`,
    `Retrieves device state given a device ID.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      getDeviceState(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `getRegistry <registryId>`,
    `Retrieves a registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await getRegistry(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `listDevices <registryId>`,
    `Lists the devices in a given registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await listDevices(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `listRegistries`,
    `Lists the registries in a given project.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await listRegistries(client, opts.projectId, opts.cloudRegion);
    }
  )
  .command(
    `patchEs256 <deviceId> <registryId> <es256Path>`,
    `Patches a device with ES256 authorization credentials.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await patchEs256ForAuth(
        client,
        opts.deviceId,
        opts.registryId,
        opts.es256Path,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `patchRsa256 <deviceId> <registryId> <rsa256Path>`,
    `Patches a device with RSA256 authentication credentials.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await patchRsa256ForAuth(
        client,
        opts.deviceId,
        opts.registryId,
        opts.rsa256Path,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `setConfig <deviceId> <registryId> <configuration> <version>`,
    `Sets a devices configuration to the specified data.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await setDeviceConfig(
        client,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.configuration,
        opts.version || 0
      );
    }
  )
  .command(
    `sendCommand <deviceId> <registryId> <commandMsg>`,
    `Sends a command message to a device subscribed to the commands topic`,
    {},
    async (opts) => {
      await sendCommand(
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.commandMsg
      );
    }
  )
  .command(
    `getIamPolicy <registryId>`,
    `Gets the IAM permissions for a given registry`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await getIamPolicy(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion
      );
    }
  )
  .command(
    `setIamPolicy <registryId> <member> <role>`,
    `Gets the IAM permissions for a given registry`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await setIamPolicy(
        client,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.member,
        opts.role
      );
    }
  )
  .command(
    `createGateway`,
    `Creates a gateway`,
    {
      registryId: {
        description:
          'Enter a permanent ID that starts with a lower case letter. Must end in a letter or number.',
        requiresArg: true,
        type: 'string',
      },
      gatewayId: {
        description:
          'Enter a permanent ID that starts with a lowercase letter. Must end in a letter or number',
        requiresArg: true,
        type: 'string',
      },
      publicKeyFormat: {
        alias: 'format',
        default: 'RSA_X509_PEM',
        description: 'Public key format for devices.',
        requiresArg: true,
        choices: ['RSA_PEM', 'RSA_X509_PEM', 'ES256_PEM', 'ES256_X509_PEM'],
        type: 'string',
      },
      publicKeyFile: {
        alias: 'key',
        description:
          'Path to the public key file used for device authentication.',
        requiresArg: true,
        type: 'string',
      },
      gatewayAuthMethod: {
        default: 'ASSOCIATION_ONLY',
        description:
          'Determines how Cloud IoT Core verifies and trusts devices associated with this gateway.',
        requiresArg: true,
        choices: [
          'ASSOCIATION_ONLY',
          'DEVICE_AUTH_TOKEN_ONLY',
          'ASSOCIATION_AND_DEVICE_AUTH_TOKEN',
          'GATEWAY_AUTH_METHOD_UNSPECIFIED',
        ],
        type: 'string',
      },
    },
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await createGateway(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.gatewayId,
        opts.publicKeyFormat,
        opts.publicKeyFile
      );
    }
  )
  .command(
    `listGateways <registryId>`,
    `Lists gateways in a registry.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await listGateways(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId
      );
    }
  )
  .command(
    `bindDeviceToGateway <registryId> <gatewayId> <deviceId>`,
    `Binds a device to a gateway`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await bindDeviceToGateway(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.deviceId,
        opts.gatewayId
      );
    }
  )
  .command(
    `unbindDeviceFromGateway <registryId> <gatewayId> <deviceId>`,
    `Unbinds a device from a gateway`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await unbindDeviceFromGateway(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.deviceId,
        opts.gatewayId
      );
    }
  )
  .command(
    `unbindDeviceFromAllGateways <registryId> <deviceId>`,
    `Unbinds a device from all gateways`,
    {},
    async (opts) => {
      await unbindDeviceFromAllGateways(
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.deviceId
      );
    }
  )
  .command(
    `unbindAllDevices <registryId>`,
    `Unbinds all devices in a given registry. Mainly for clearing registries`,
    {},
    async (opts) => {
      await unbindAllDevices(opts.projectId, opts.cloudRegion, opts.registryId);
    }
  )
  .command(
    `listDevicesForGateway <registryId> <gatewayId>`,
    `Lists devices in a gateway.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await listDevicesForGateway(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.gatewayId
      );
    }
  )
  .command(
    `listGatewaysForDevice <registryId> <deviceId>`,
    `Lists gateways for a given device.`,
    {},
    async (opts) => {
      const client = await getClient(opts.serviceAccount);
      await listGatewaysForDevice(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.deviceId
      );
    }
  )
  .example(
    `node $0 createDevice my-device my-registry RS256_X509_PEM ./rsa_cert.pem`
  )
  .example(
    `node $0 createEs256Device my-es-device my-registry ../ec_public.pem`
  )
  .example(
    `node $0 createRegistry my-registry my-iot-topic --serviceAccount=$secure/svc.json --projectId=my-project-id`
  )
  .example(
    `node $0 createRsa256Device my-rsa-device my-registry ../rsa_cert.pem`
  )
  .example(
    `node $0 createGateway --registryId=my-registry --gatewayId=my-gateway\
    --format=RS256_X509_PEM --key=./rsa_cert.pem`
  )
  .example(`node $0 createUnauthDevice my-device my-registry`)
  .example(`node $0 deleteDevice my-device my-registry`)
  .example(`node $0 deleteRegistry my-device my-registry`)
  .example(`node $0 getDevice my-device my-registry`)
  .example(`node $0 getDeviceState my-device my-registry`)
  .example(`node $0 getIamPolicy my-registry`)
  .example(`node $0 getRegistry my-registry`)
  .example(
    `node $0 listDevices -s path/svc.json -p your-project-id -c asia-east1 my-registry`
  )
  .example(
    `node $0 listRegistries -s path/svc.json -p your-project-id -c europe-west1`
  )
  .example(`node $0 patchRsa256 my-device my-registry ../rsa_cert.pem`)
  .example(`node $0 patchEs256 my-device my-registry ../ec_public.pem`)
  .example(`node $0 setConfig my-device my-registry "test" 0`)
  .example(`node $0 sendCommand my-device my-registry test`)
  .example(
    `node $0 setIamPolicy my-registry user:example@example.com roles/viewer`
  )
  .example(
    `node $0 setupTopic my-iot-topic --serviceAccount=$HOME/creds_iot.json --projectId=my-project-id`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;
