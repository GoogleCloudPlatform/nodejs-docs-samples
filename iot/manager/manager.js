/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable prefer-destructuring */

'use strict';

const fs = require('fs');
const {google} = require('googleapis');
const iot = require('@google-cloud/iot');

const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

const client = new iot.v1.DeviceManagerClient();

// Configures the topic for Cloud IoT Core.
const setupIotTopic = async topicName => {
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

  policy.bindings.forEach(_binding => {
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
    console.error('ERROR:', err);
  }
};

const createIotTopic = async topicName => {
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: registryName,
  };

  try {
    const {data} = await client.projects.locations.registries.get(request);

    console.log('Looked up existing registry');
    console.log(data);
  } catch (err) {
    console.log('Could not look up registry');
    console.log(err);
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
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // function errCb = lookupRegistry; // Lookup registry if already exists.
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const pubsubTopic = `projects/${projectId}/topics/${pubsubTopicId}`;

  const request = {
    parent: parentName,
    resource: {
      eventNotificationConfigs: [
        {
          pubsubTopicName: pubsubTopic,
        },
      ],
      id: registryId,
    },
  };

  try {
    const {data} = await client.projects.locations.registries.create(request);

    console.log('Successfully created registry');
    console.log(data);
  } catch (err) {
    console.log('Could not create registry');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';

  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const body = {
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
    parent: registryName,
    resource: body,
  };

  try {
    const {data} = await client.projects.locations.registries.devices.create(
      request
    );

    console.log('Created device');
    console.log(data);
  } catch (err) {
    console.log('Could not create device');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  console.log('Creating device:', deviceId);
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  const request = {
    parent: registryName,
    resource: {id: deviceId},
  };

  try {
    const {data} = await client.projects.locations.registries.devices.create(
      request
    );

    console.log('Created device');
    console.log(data);
  } catch (err) {
    console.log('Could not create device');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-rsa-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const body = {
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
    parent: registryName,
    resource: body,
  };

  console.log(JSON.stringify(request));

  try {
    const {data} = await client.projects.locations.registries.devices.create(
      request
    );

    console.log('Created device');
    console.log(data);
  } catch (err) {
    console.log('Could not create device');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-es-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const body = {
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
    parent: registryName,
    resource: body,
  };

  try {
    const {data} = await client.projects.locations.registries.devices.create(
      request
    );

    console.log('Created device');
    console.log(data);
  } catch (err) {
    console.log('Could not create device');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-rsa-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    updateMask: 'credentials',
    resource: {
      credentials: [
        {
          publicKey: {
            format: 'RSA_X509_PEM',
            key: fs.readFileSync(rsaPublicKeyFile).toString(),
          },
        },
      ],
    },
  };

  try {
    const {data} = await client.projects.locations.registries.devices.patch(
      request
    );

    console.log('Patched device:', deviceId);
    console.log(data);
  } catch (err) {
    console.log('Error patching device:', deviceId);
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-es-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    updateMask: 'credentials',
    resource: {
      credentials: [
        {
          publicKey: {
            format: 'ES256_PEM',
            key: fs.readFileSync(esPublicKeyFile).toString(),
          },
        },
      ],
    },
  };

  try {
    const {data} = await client.projects.locations.registries.devices.patch(
      request
    );

    console.log('Patched device:', deviceId);
    console.log(data);
  } catch (err) {
    console.log('Error patching device:', deviceId);
    console.log(err);
  }
  // [END iot_patch_es]
};

// List all of the devices in the given registry.
const listDevices = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_list_devices]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  const request = {
    parent: registryName,
  };

  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    console.log('Current devices in registry:', data['devices']);
  } catch (err) {
    console.log('Could not list devices');
    console.log(err);
  }
  // [END iot_list_devices]
};

// List all of the registries in the given project.
const listRegistries = async (client, projectId, cloudRegion) => {
  // [START iot_list_registries]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;

  const request = {
    parent: parentName,
  };

  try {
    const {data} = await client.projects.locations.registries.list(request);
    console.log('Current registries in project:\n', data['deviceRegistries']);
  } catch (err) {
    console.log('Could not list registries');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  try {
    const {data} = await client.projects.locations.registries.devices.delete(
      request
    );

    console.log('Successfully deleted device:', deviceId);
    console.log(data);
  } catch (err) {
    console.log('Could not delete device:', deviceId);
    console.log(err);
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
    console.log('Could not list devices', err);
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
    console.log('Could not delete registry', err);
  }
};

// Delete the given registry. Note that this will only succeed if the registry
// is empty.
const deleteRegistry = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_delete_registry]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: registryName,
  };

  try {
    const res = await client.projects.locations.registries.delete(request);

    console.log('Successfully deleted registry');
    console.log(res);
  } catch (err) {
    console.log('Could not delete registry');
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  try {
    const {data} = await client.projects.locations.registries.devices.get(
      request
    );

    console.log('Found device:', deviceId);
    console.log(data);
  } catch (err) {
    console.log('Could not find device:', deviceId);
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  try {
    const {
      data,
    } = await client.projects.locations.registries.devices.states.list(request);
    console.log('State:', data);
  } catch (err) {
    console.log('Could not find device:', deviceId);
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  try {
    const {
      data,
    } = await client.projects.locations.registries.devices.configVersions.list(
      request
    );

    console.log('Configs:', data);
  } catch (err) {
    console.log('Could not find device:', deviceId);
    console.log(err);
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
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // const data = 'test-data';
  // const version = 0;
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  const binaryData = Buffer.from(data).toString('base64');
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    versionToUpdate: version,
    binaryData: binaryData,
  };

  try {
    const {
      data,
    } = await client.projects.locations.registries.devices.modifyCloudToDeviceConfig(
      request
    );

    console.log('Success:', data);
  } catch (err) {
    console.log('Could not update config:', deviceId);
    console.log('Message:', err);
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
  // const iot = require('@google-cloud/iot');
  // const client = new iot.v1.DeviceManagerClient();
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';

  const binaryData = Buffer.from(commandMessage).toString('base64');

  const formattedName = client.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceId
  );

  // NOTE: The device must be subscribed to the wildcard subfolder
  // or you should specify a subfolder.
  const request = {
    name: formattedName,
    binaryData: binaryData,
    //subfolder: <your-subfolder>
  };

  try {
    await client.sendCommandToDevice(request);

    console.log('Sent command');
  } catch (err) {
    console.error(err);
  }
  // [END iot_send_command]
};

// Retrieve the given device from the registry.
const getRegistry = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_get_registry]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}`,
  };

  try {
    const {data} = await client.projects.locations.registries.get(request);

    console.log('Found registry:', registryId);
    console.log(data);
  } catch (err) {
    console.log('Could not find registry:', registryId);
    console.log(err);
  }
  // [END iot_get_registry]
};

// Returns an authorized API client by discovering the Cloud IoT Core API with
// the provided API key.
const getClient = async serviceAccountJson => {
  // the getClient method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
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
    console.log('Error during API discovery.', err);
  }
};

// Retrieves the IAM policy for a given registry.
const getIamPolicy = async (client, registryId, projectId, cloudRegion) => {
  // [START iot_get_iam_policy]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    resource_: `${registryName}`,
  };

  let bindings, etag;
  try {
    const {data} = await client.projects.locations.registries.getIamPolicy(
      request
    );
    bindings = data.bindings;
    etag = data.etag;
  } catch (err) {
    console.log('Could not find policy for: ', registryId);
    console.log('Trace: ', err);
    return;
  }

  console.log(`ETAG: ${etag}`);
  bindings = bindings || [];
  bindings.forEach(_binding => {
    console.log(`Role: ${_binding.role}`);
    _binding.members || (_binding.members = []);
    _binding.members.forEach(_member => {
      console.log(`\t${_member}`);
    });
  });
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
  // Client retrieved in callback
  // setClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    resource_: `${registryName}`,
    resource: {
      policy: {
        bindings: [
          {
            members: member,
            role: role,
          },
        ],
      },
    },
  };

  let bindings, etag;
  try {
    const {data} = await client.projects.locations.registries.setIamPolicy(
      request
    );
    bindings = data.bindings;
    etag = data.etag;

    console.log(JSON.stringify(data));
  } catch (err) {
    console.log('Could not set policy for: ', registryId);
    console.log('Trace: ', err);
  }

  console.log(`ETAG: ${etag}`);
  bindings = bindings || [];
  bindings.forEach(_binding => {
    console.log(`Role: ${_binding.role}`);
    _binding.members || (_binding.members = []);
    _binding.members.forEach(_member => {
      console.log(`\t${_member}`);
    });
  });
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
  publicKeyFile
) => {
  // [START iot_create_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
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

  const createRequest = {
    parent: parentName,
    resource: {
      id: gatewayId,
      credentials: credentials,
      gatewayConfig: {
        gatewayType: 'GATEWAY',
        gatewayAuthMethod: 'ASSOCIATION_ONLY',
      },
    },
  };

  try {
    const {data} = await client.projects.locations.registries.devices.create(
      createRequest
    );

    console.log('Created device');
    console.log(data);
  } catch (err) {
    console.log('Could not create device');
    console.log(err);
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

  console.log(`Binding device: ${deviceId}`);
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;

  const bindRequest = {
    parent: parentName,
    deviceId: deviceId,
    gatewayId: gatewayId,
  };

  try {
    await client.projects.locations.registries.bindDeviceToGateway(bindRequest);

    console.log(`Bound ${deviceId} to`, gatewayId);
  } catch (err) {
    console.log('Could not bind device', err);
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
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;

  const unbindRequest = {
    parent: parentName,
    deviceId: deviceId,
    gatewayId: gatewayId,
  };

  try {
    await client.projects.locations.registries.unbindDeviceFromGateway(
      unbindRequest
    );

    console.log(`Unbound ${deviceId} from`, gatewayId);
  } catch (err) {
    console.log('Could not unbind device', err);
  }
  // [END iot_unbind_device_to_gateway]
};

// Unbinds the given device from all gateways
const unbindDeviceFromAllGateways = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) => {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  // get information about this device
  let device;
  try {
    const {data} = await client.projects.locations.registries.devices.get(
      request
    );
    device = data;
  } catch (err) {
    console.error('Could not get device', err);
    return;
  }

  if (device) {
    const isGateway = device.gatewayConfig.gatewayType === 'GATEWAY';

    if (!isGateway) {
      const listGatewaysForDeviceRequest = {
        parent: registryName,
        'gatewayListOptions.associationsDeviceId': deviceId,
      };

      // get list of all gateways this non-gateway device is bound to
      let gateways;
      try {
        const {
          devices,
        } = await client.projects.locations.registries.devices.list(
          listGatewaysForDeviceRequest
        );
        gateways = devices;
      } catch (err) {
        console.error('Could not list gateways', err);
        return;
      }

      if (gateways && gateways > 0) {
        const promises = gateways.map(gateway => {
          const unbindRequest = {
            parent: registryName,
            deviceId: device.id,
            gatewayId: gateway.id,
          };

          // for each gateway, make the call to unbind it
          return new Promise((resolve, reject) => {
            try {
              client.projects.locations.registries.unbindDeviceFromGateway(
                unbindRequest
              );
              console.log('Unbound device from gateways', gateway.id);
              resolve();
            } catch (err) {
              console.log('Could not unbind device', err);
              reject();
            }
          });
        });

        return Promise.all(promises);
      }
    }
  }
};

const unbindAllDevices = async (client, projectId, cloudRegion, registryId) => {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    parent: registryName,
  };

  // get information about this device
  let devices;
  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    devices = data.devices;
  } catch (err) {
    console.log('Could not list devices', err);
    return;
  }

  if (devices && devices.length > 0) {
    const promises = devices.map(device => {
      if (device) {
        const isGateway =
          device.gatewayConfig &&
          device.gatewayConfig.gatewayType === 'GATEWAY';

        if (!isGateway) {
          return unbindDeviceFromAllGateways(
            client,
            projectId,
            cloudRegion,
            registryId,
            device.id
          );
        }
      }
    });

    return Promise.all(promises);
  }
};

// Lists gateways in a registry.
const listGateways = async (client, projectId, cloudRegion, registryId) => {
  // [START iot_list_gateways]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  const request = {
    parent: parentName,
    fieldMask: 'config,gatewayConfig',
  };

  let devices;
  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    devices = data.devices;
  } catch (err) {
    console.log('Could not list devices');
    console.log(err);
    return;
  }

  console.log('Current gateways in registry:');
  devices.forEach(device => {
    if (
      device.gatewayConfig !== undefined &&
      device.gatewayConfig.gatewayType === 'GATEWAY'
    ) {
      console.log('----\n', device);
    } else {
      console.log('\t', device);
    }
  });
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
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  const request = {
    parent: parentName,
    'gatewayListOptions.associationsGatewayId': gatewayId,
  };

  let devices;
  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    devices = data.devices;
  } catch (err) {
    console.log('Could not list devices');
    console.log(err);
    return;
  }

  console.log('Current devices bound to gateway: ', gatewayId);
  if (devices && devices.length > 0) {
    devices.forEach(device => {
      console.log(`\tDevice: ${device.numId} : ${device.id}`);
    });
  } else {
    console.log('No devices bound to this gateway.');
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
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  const request = {
    parent: parentName,
    'gatewayListOptions.associationsDeviceId': deviceId,
  };

  let devices;
  try {
    const {data} = await client.projects.locations.registries.devices.list(
      request
    );
    devices = data.devices;
  } catch (err) {
    console.log('Could not list gateways for device');
    console.log(err);
    return;
  }

  console.log('Current gateways for device:', deviceId);
  if (devices && devices.length > 0) {
    devices.forEach(gateway => {
      console.log(`\tDevice: ${gateway.numId} : ${gateway.id}`);
    });
  } else {
    console.log('No gateways associated with this device.');
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
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    opts => createIotTopic(opts.pubsubTopic)
  )
  .command(
    `setupIotTopic <pubsubTopic>`,
    `Configures the PubSub topic for Cloud IoT Core.`,
    {},
    opts => setupIotTopic(opts.pubsubTopic)
  )
  .command(
    `deleteDevice <deviceId> <registryId>`,
    `Deletes a device from the device registry.`,
    {},
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
      const client = await getClient(opts.serviceAccount);
      await listRegistries(client, opts.projectId, opts.cloudRegion);
    }
  )
  .command(
    `patchEs256 <deviceId> <registryId> <es256Path>`,
    `Patches a device with ES256 authorization credentials.`,
    {},
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    `createGateway <registryId> <gatewayId>`,
    `Creates a gateway`,
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
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
    async opts => {
      const client = await getClient(opts.serviceAccount);
      await unbindDeviceFromAllGateways(
        client,
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
    async opts => {
      const client = await getClient(opts.serviceAccount);
      await unbindAllDevices(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId
      );
    }
  )
  .command(
    `listDevicesForGateway <registryId> <gatewayId>`,
    `Lists devices in a gateway.`,
    {},
    async opts => {
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
    async opts => {
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
