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

'use strict';

const fs = require('fs');
const {google} = require('googleapis');

const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

// Configures the topic for Cloud IoT Core.
function setupIotTopic(topicName) {
  const {PubSub} = require('@google-cloud/pubsub');

  const pubsub = new PubSub();
  const topic = pubsub.topic(topicName);
  const serviceAccount = `serviceAccount:cloud-iot@system.gserviceaccount.com`;

  topic.iam
    .getPolicy()
    .then(results => {
      const policy = results[0] || {};
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
      return topic.iam.setPolicy(policy);
    })
    .then(results => {
      const updatedPolicy = results[0];

      console.log(JSON.stringify(updatedPolicy, null, 2));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

function createIotTopic(topicName) {
  // Imports the Google Cloud client library
  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates a client
  const pubsub = new PubSub();

  pubsub.createTopic(topicName).then(() => {
    setupIotTopic(topicName);
  });
}

// Lookup the registry, assuming that it exists.
function lookupRegistry(client, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.get(request, (err, res) => {
    if (err) {
      console.log('Could not look up registry');
      console.log(err);
    } else {
      console.log('Looked up existing registry');
      console.log(res.data);
    }
  });
  // [END iot_lookup_registry]
}

function createRegistry(
  client,
  registryId,
  projectId,
  cloudRegion,
  pubsubTopicId,
  foundCb
) {
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

  client.projects.locations.registries.create(request, (err, res) => {
    if (err) {
      if (err.code === 409) {
        // The registry already exists - look it up instead.
        foundCb(client, registryId, projectId, cloudRegion);
      } else {
        console.log('Could not create registry');
        console.log(err);
      }
    } else {
      console.log('Successfully created registry');
      console.log(res.data);
    }
  });
  // [END iot_create_registry]
}

// Create a new registry, or look up an existing one if it doesn't exist.
function lookupOrCreateRegistry(
  client,
  registryId,
  projectId,
  cloudRegion,
  pubsubTopicId
) {
  // [START iot_lookup_or_create_registry]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  // const pubsubTopicId = 'my-iot-topic';

  createRegistry(
    client,
    registryId,
    projectId,
    cloudRegion,
    pubsubTopicId,
    lookupRegistry
  );
  // [END iot_lookup_or_create_registry]
}

// Create a new device with a given public key format
function createDevice(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  publicKeyFormat,
  publicKeyFile
) {
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

  client.projects.locations.registries.devices.create(request, (err, res) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(res.data);
    }
  });
  // [END iot_create_device]
}

// Create a new device with the given id. The body defines the parameters for
// the device, such as authentication.
function createUnauthDevice(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) {
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

  client.projects.locations.registries.devices.create(request, (err, res) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(res.data);
    }
  });
  // [END iot_create_unauth_device]
}

// Create a device using RSA256 for authentication.
function createRsaDevice(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  rsaCertificateFile
) {
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

  client.projects.locations.registries.devices.create(request, (err, res) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(res.data);
    }
  });
  // [END iot_create_rsa_device]
}

// Create a device using ES256 for authentication.
function createEsDevice(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  esCertificateFile
) {
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

  client.projects.locations.registries.devices.create(request, (err, res) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(res.data);
    }
  });
  // [END iot_create_es_device]
}

// Add RSA256 authentication to the given device.
function patchRsa256ForAuth(
  client,
  deviceId,
  registryId,
  rsaPublicKeyFile,
  projectId,
  cloudRegion
) {
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

  client.projects.locations.registries.devices.patch(request, (err, res) => {
    if (err) {
      console.log('Error patching device:', deviceId);
      console.log(err);
    } else {
      console.log('Patched device:', deviceId);
      console.log(res.data);
    }
  });
  // [END iot_patch_rsa]
}

// Add ES256 authentication to the given device.
function patchEs256ForAuth(
  client,
  deviceId,
  registryId,
  esPublicKeyFile,
  projectId,
  cloudRegion
) {
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

  client.projects.locations.registries.devices.patch(request, (err, res) => {
    if (err) {
      console.log('Error patching device:', deviceId);
      console.log(err);
    } else {
      console.log('Patched device:', deviceId);
      console.log(res.data);
    }
  });
  // [END iot_patch_es]
}

// List all of the devices in the given registry.
function listDevices(client, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list devices');
      console.log(err);
    } else {
      let data = res.data;
      console.log('Current devices in registry:', data['devices']);
    }
  });
  // [END iot_list_devices]
}

// List all of the registries in the given project.
function listRegistries(client, projectId, cloudRegion) {
  // [START iot_list_registries]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;

  const request = {
    parent: parentName,
  };

  client.projects.locations.registries.list(request, (err, res) => {
    if (err) {
      console.log('Could not list registries');
      console.log(err);
    } else {
      let data = res.data;
      console.log('Current registries in project:\n', data['deviceRegistries']);
    }
  });
  // [END iot_list_registries]
}

// Delete the given device from the registry.
function deleteDevice(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  cb
) {
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

  client.projects.locations.registries.devices.delete(request, (err, res) => {
    if (err) {
      console.log('Could not delete device:', deviceId);
      console.log(err);
    } else {
      console.log('Successfully deleted device:', deviceId);
      console.log(res.data);
      if (cb) {
        cb();
      }
    }
  });
  // [END iot_delete_device]
}

// Clear the given registry by removing all devices and deleting the registry.
function clearRegistry(client, registryId, projectId, cloudRegion) {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const requestDelete = {
    name: registryName,
  };

  const after = function() {
    client.projects.locations.registries.delete(requestDelete, (err, res) => {
      if (err) {
        console.log('Could not delete registry', err);
      } else {
        console.log(`Successfully deleted registry ${registryName}`);
        console.log(res.data);
      }
    });
  };

  const request = {
    parent: registryName,
  };

  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list devices', err);
      return;
    }

    let data = res.data;
    console.log('Current devices in registry:', data['devices']);
    let devices = data['devices'];

    if (devices) {
      devices.forEach((device, index) => {
        console.log(`${device.id} [${index}/${devices.length}] removed`);
        if (index === devices.length - 1) {
          deleteDevice(
            client,
            device.id,
            registryId,
            projectId,
            cloudRegion,
            after
          );
        } else {
          deleteDevice(client, device.id, registryId, projectId, cloudRegion);
        }
      });
    } else {
      after();
    }
  });
}

// Delete the given registry. Note that this will only succeed if the registry
// is empty.
function deleteRegistry(client, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.delete(request, (err, res) => {
    if (err) {
      console.log('Could not delete registry');
      console.log(err);
    } else {
      console.log('Successfully deleted registry');
      console.log(res);
    }
  });
  // [END iot_delete_registry]
}

// Retrieve the given device from the registry.
function getDevice(client, deviceId, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.devices.get(request, (err, res) => {
    if (err) {
      console.log('Could not find device:', deviceId);
      console.log(err);
    } else {
      console.log('Found device:', deviceId);
      console.log(res.data);
    }
  });
  // [END iot_get_device]
}

// Retrieve the given device's state from the registry.
function getDeviceState(client, deviceId, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.devices.states.list(
    request,
    (err, data) => {
      if (err) {
        console.log('Could not find device:', deviceId);
        console.log(err);
      } else {
        console.log('State:', data.data);
      }
    }
  );
  // [END iot_get_device_state]
}

// Retrieve the given device's configuration history from the registry.
function getDeviceConfigs(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion
) {
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

  client.projects.locations.registries.devices.configVersions.list(
    request,
    (err, data) => {
      if (err) {
        console.log('Could not find device:', deviceId);
        console.log(err);
      } else {
        console.log('Configs:', data.data);
      }
    }
  );
  // [END iot_get_device_configs]
}

// Send configuration data to device.
function setDeviceConfig(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  data,
  version
) {
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

  client.projects.locations.registries.devices.modifyCloudToDeviceConfig(
    request,
    (err, data) => {
      if (err) {
        console.log('Could not update config:', deviceId);
        console.log('Message: ', err);
      } else {
        console.log('Success :', data);
      }
    }
  );
  // [END iot_set_device_config]
}

// sends a command to a specified device subscribed to the commands topic
function sendCommand(
  client,
  deviceId,
  registryId,
  projectId,
  cloudRegion,
  commandMessage
) {
  // [START iot_send_command]
  // Client retrieved in callback
  // getClient(serviceAccountJson, function(client) {...});
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-device';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;

  const binaryData = Buffer.from(commandMessage).toString('base64');

  // NOTE: The device must be subscribed to the wildcard subfolder
  // or you should pass a subfolder
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    binaryData: binaryData,
    //subfolder: <your-subfolder>
  };

  client.projects.locations.registries.devices.sendCommandToDevice(
    request,
    (err, data) => {
      if (err) {
        console.log('Could not send command:', request);
        console.log('Error: ', err);
      } else {
        console.log('Success:', data.status);
      }
    }
  );
  // [END iot_send_command]
}

// Retrieve the given device from the registry.
function getRegistry(client, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.get(request, (err, data) => {
    if (err) {
      console.log('Could not find registry:', registryId);
      console.log(err);
    } else {
      console.log('Found registry:', registryId);
      console.log(data.data);
    }
  });
  // [END iot_get_registry]
}

// Returns an authorized API client by discovering the Cloud IoT Core API with
// the provided API key.
function getClient(serviceAccountJson, cb) {
  // the getClient method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
  // environment variables if serviceAccountJson is not passed in
  google.auth
    .getClient({
      keyFilename: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    .then(authClient => {
      const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;

      google.options({
        auth: authClient,
      });

      google
        .discoverAPI(discoveryUrl)
        .then(client => {
          cb(client);
        })
        .catch(err => {
          console.log('Error during API discovery.', err);
        });
    });
}

// Retrieves the IAM policy for a given registry.
function getIamPolicy(client, registryId, projectId, cloudRegion) {
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

  client.projects.locations.registries.getIamPolicy(request, (err, data) => {
    if (err) {
      console.log('Could not find policy for: ', registryId);
      console.log('Trace: ', err);
    } else {
      data = data.data;
      console.log(`ETAG: ${data.etag}`);
      data.bindings = data.bindings || [];
      data.bindings.forEach(_binding => {
        console.log(`Role: ${_binding.role}`);
        _binding.members || (_binding.members = []);
        _binding.members.forEach(_member => {
          console.log(`\t${_member}`);
        });
      });
    }
  });
  // [END iot_get_iam_policy]
}

// Sets the IAM permissions for a given registry to a single member / role.
function setIamPolicy(
  client,
  registryId,
  projectId,
  cloudRegion,
  member,
  role
) {
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

  client.projects.locations.registries.setIamPolicy(request, (err, data) => {
    if (err) {
      console.log('Could not set policy for: ', registryId);
      console.log('Trace: ', err);
    } else {
      console.log(`ETAG: ${data.etag}`);
      console.log(JSON.stringify(data));
      data.bindings = data.bindings || [];
      data.bindings.forEach(_binding => {
        console.log(`Role: ${_binding.role}`);
        _binding.members || (_binding.members = []);
        _binding.members.forEach(_member => {
          console.log(`\t${_member}`);
        });
      });
    }
  });
  // [END iot_set_iam_policy]
}

// Creates a gateway.
function createGateway(
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId,
  publicKeyFormat,
  publicKeyFile
) {
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

  client.projects.locations.registries.devices.create(
    createRequest,
    (err, res) => {
      if (err) {
        console.log('Could not create device');
        console.log(err);
      } else {
        console.log('Created device');
        console.log(res.data);
      }
    }
  );
  // [END iot_create_gateway]
}

// Binds a device to a gateway so that it can be attached.
function bindDeviceToGateway(
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId,
  gatewayId
) {
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

  client.projects.locations.registries.bindDeviceToGateway(bindRequest, err => {
    if (err) {
      console.log('Could not bind device', err);
    } else {
      console.log(`Bound ${deviceId} to`, gatewayId);
    }
  });
  // [END iot_bind_device_to_gateway]
}

// Unbinds a device from a gateway.
function unbindDeviceFromGateway(
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId,
  gatewayId
) {
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

  client.projects.locations.registries.unbindDeviceFromGateway(
    unbindRequest,
    err => {
      if (err) {
        console.log('Could not unbind device', err);
      } else {
        console.log(`Unbound ${deviceId} from`, gatewayId);
      }
    }
  );
  // [END iot_unbind_device_to_gateway]
}

// Unbinds the given device from all gateways
function unbindDeviceFromAllGateways(
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
  };

  // get information about this device
  client.projects.locations.registries.devices.get(request, (err, res) => {
    if (err) {
      console.error('Could not get device', err);
      return;
    }

    let device = res.data;
    if (device) {
      let isGateway = device.gatewayConfig.gatewayType === 'GATEWAY';

      if (!isGateway) {
        const listGatewaysForDeviceRequest = {
          parent: registryName,
          'gatewayListOptions.associationsDeviceId': deviceId,
        };

        // get list of all gateways this non-gateway device is bound to
        client.projects.locations.registries.devices.list(
          listGatewaysForDeviceRequest,
          (err, res) => {
            if (err) {
              console.error('Could not list gateways', err);
              return;
            }

            let data = res.data;
            if (data.devices && data.devices.length > 0) {
              let gateways = data.devices;

              gateways.forEach(gateway => {
                const unbindRequest = {
                  parent: registryName,
                  deviceId: device.id,
                  gatewayId: gateway.id,
                };

                // for each gateway, make the call to unbind it
                client.projects.locations.registries.unbindDeviceFromGateway(
                  unbindRequest,
                  err => {
                    if (err) {
                      console.log('Could not unbind device', err);
                    } else {
                      console.log('Unbound device from gateways', gateway.id);
                    }
                  }
                );
              });
            }
          }
        );
      }
    }
  });
}

function unbindAllDevices(client, projectId, cloudRegion, registryId) {
  const parentName = `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    parent: registryName,
  };

  // get information about this device
  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list devices', err);
      return;
    }

    let data = res.data;
    if (!data) {
      return;
    }

    let devices = data.devices;

    if (devices && devices.length > 0) {
      devices.forEach(device => {
        if (device) {
          let isGateway =
            device.gatewayConfig &&
            device.gatewayConfig.gatewayType === 'GATEWAY';

          if (!isGateway) {
            unbindDeviceFromAllGateways(
              client,
              projectId,
              cloudRegion,
              registryId,
              device.id
            );
          }
        }
      });
    }
  });
}

// Lists gateways in a registry.
function listGateways(client, projectId, cloudRegion, registryId) {
  // [START iot_list_gateways]
  // const cloudRegion = 'us-central1';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  const request = {
    parent: parentName,
    fieldMask: 'config,gatewayConfig',
  };

  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list devices');
      console.log(err);
    } else {
      let data = res.data;
      console.log('Current gateways in registry:');
      data.devices.forEach(function(device) {
        if (
          device.gatewayConfig !== undefined &&
          device.gatewayConfig.gatewayType === 'GATEWAY'
        ) {
          console.log('----\n', device);
        } else {
          console.log('\t', device);
        }
      });
    }
  });
  // [END iot_list_gateways]
}

// Lists devices bound to a gateway.
function listDevicesForGateway(
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId
) {
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

  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list devices');
      console.log(err);
    } else {
      console.log('Current devices bound to gateway: ', gatewayId);
      let data = res.data;
      if (data.devices && data.devices.length > 0) {
        data.devices.forEach(device => {
          console.log(`\tDevice: ${device.numId} : ${device.id}`);
        });
      } else {
        console.log('No devices bound to this gateway.');
      }
    }
  });
  // [END iot_list_devices_for_gateway]
}

// Lists gateways a given device is bound to.
function listGatewaysForDevice(
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) {
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

  client.projects.locations.registries.devices.list(request, (err, res) => {
    if (err) {
      console.log('Could not list gateways for device');
      console.log(err);
    } else {
      console.log('Current gateways for device:', deviceId);
      let data = res.data;
      if (data.devices && data.devices.length > 0) {
        data.devices.forEach(gateway => {
          console.log(`\tDevice: ${gateway.numId} : ${gateway.id}`);
        });
      } else {
        console.log('No gateways associated with this device.');
      }
    }
  });
  // [END iot_list_gateways_for_device]
}

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
    opts => {
      const cb = function(client) {
        createRsaDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.rsaPath
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `createEs256Device <deviceId> <registryId> <esPath>`,
    `Creates an ES256 device.`,
    {},
    opts => {
      const cb = function(client) {
        createEsDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.esPath
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `createUnauthDevice <deviceId> <registryId>`,
    `Creates a device without authorization.`,
    {},
    opts => {
      const cb = function(client) {
        createUnauthDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
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
    opts => {
      const cb = client => {
        createDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.publicKeyFormat,
          opts.publicKeyFile
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `createRegistry <registryId> <pubsubTopic>`,
    `Creates a device registry.`,
    {},
    opts => {
      const cb = function(client) {
        lookupOrCreateRegistry(
          client,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.pubsubTopic
        );
      };
      getClient(opts.serviceAccount, cb);
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
    opts => {
      const cb = function(client) {
        deleteDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `clearRegistry <registryId>`,
    `!!Be careful! Removes all devices and then deletes a device registry!!`,
    {},
    opts => {
      const cb = function(client) {
        clearRegistry(
          client,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteRegistry <registryId>`,
    `Deletes a device registry.`,
    {},
    opts => {
      const cb = function(client) {
        deleteRegistry(
          client,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `getDevice <deviceId> <registryId>`,
    `Retrieves device info given a device ID.`,
    {},
    opts => {
      const cb = function(client) {
        getDevice(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `getDeviceConfigs <deviceId> <registryId>`,
    `Retrieves device configurations given a device ID.`,
    {},
    opts => {
      const cb = function(client) {
        getDeviceConfigs(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `getDeviceState <deviceId> <registryId>`,
    `Retrieves device state given a device ID.`,
    {},
    opts => {
      const cb = function(client) {
        getDeviceState(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(`getRegistry <registryId>`, `Retrieves a registry.`, {}, opts => {
    const cb = function(client) {
      getRegistry(client, opts.registryId, opts.projectId, opts.cloudRegion);
    };
    getClient(opts.serviceAccount, cb);
  })
  .command(
    `listDevices <registryId>`,
    `Lists the devices in a given registry.`,
    {},
    opts => {
      const cb = function(client) {
        listDevices(client, opts.registryId, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `listRegistries`,
    `Lists the registries in a given project.`,
    {},
    opts => {
      const cb = function(client) {
        listRegistries(client, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `patchEs256 <deviceId> <registryId> <es256Path>`,
    `Patches a device with ES256 authorization credentials.`,
    {},
    opts => {
      const cb = function(client) {
        patchEs256ForAuth(
          client,
          opts.deviceId,
          opts.registryId,
          opts.es256Path,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `patchRsa256 <deviceId> <registryId> <rsa256Path>`,
    `Patches a device with RSA256 authentication credentials.`,
    {},
    opts => {
      const cb = function(client) {
        patchRsa256ForAuth(
          client,
          opts.deviceId,
          opts.registryId,
          opts.rsa256Path,
          opts.projectId,
          opts.cloudRegion
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `setConfig <deviceId> <registryId> <configuration> <version>`,
    `Sets a devices configuration to the specified data.`,
    {},
    opts => {
      const cb = function(client) {
        setDeviceConfig(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.configuration,
          opts.version || 0
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `sendCommand <deviceId> <registryId> <commandMsg>`,
    `Sends a command message to a device subscribed to the commands topic`,
    {},
    opts => {
      const cb = client => {
        sendCommand(
          client,
          opts.deviceId,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.commandMsg
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `getIamPolicy <registryId>`,
    `Gets the IAM permissions for a given registry`,
    {},
    opts => {
      const cb = function(client) {
        getIamPolicy(client, opts.registryId, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `setIamPolicy <registryId> <member> <role>`,
    `Gets the IAM permissions for a given registry`,
    {},
    opts => {
      const cb = function(client) {
        setIamPolicy(
          client,
          opts.registryId,
          opts.projectId,
          opts.cloudRegion,
          opts.member,
          opts.role
        );
      };
      getClient(opts.serviceAccount, cb);
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
    opts => {
      const cb = function(client) {
        createGateway(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.gatewayId,
          opts.publicKeyFormat,
          opts.publicKeyFile
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `listGateways <registryId>`,
    `Lists gateways in a registry.`,
    {},
    opts => {
      const cb = function(client) {
        listGateways(client, opts.projectId, opts.cloudRegion, opts.registryId);
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `bindDeviceToGateway <registryId> <gatewayId> <deviceId>`,
    `Binds a device to a gateway`,
    {},
    opts => {
      const cb = function(client) {
        bindDeviceToGateway(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.deviceId,
          opts.gatewayId
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `unbindDeviceFromGateway <registryId> <gatewayId> <deviceId>`,
    `Unbinds a device from a gateway`,
    {},
    opts => {
      const cb = function(client) {
        unbindDeviceFromGateway(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.deviceId,
          opts.gatewayId
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `unbindDeviceFromAllGateways <registryId> <deviceId>`,
    `Unbinds a device from all gateways`,
    {},
    opts => {
      const cb = function(client) {
        unbindDeviceFromAllGateways(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.deviceId
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `unbindAllDevices <registryId>`,
    `Unbinds all devices in a given registry. Mainly for clearing registries`,
    {},
    opts => {
      const cb = client => {
        unbindAllDevices(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `listDevicesForGateway <registryId> <gatewayId>`,
    `Lists devices in a gateway.`,
    {},
    opts => {
      const cb = function(client) {
        listDevicesForGateway(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.gatewayId
        );
      };
      getClient(opts.serviceAccount, cb);
    }
  )
  .command(
    `listGatewaysForDevice <registryId> <deviceId>`,
    `Lists gateways for a given device.`,
    {},
    opts => {
      const cb = function(client) {
        listGatewaysForDevice(
          client,
          opts.projectId,
          opts.cloudRegion,
          opts.registryId,
          opts.deviceId
        );
      };
      getClient(opts.serviceAccount, cb);
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
