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
const google = require('googleapis');

const API_VERSION = 'v1alpha1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

// Configures the topic for Cloud IoT Core.
function setupIotTopic (topicName) {
  const PubSub = require('@google-cloud/pubsub');

  const pubsub = PubSub();
  const topic = pubsub.topic(topicName);
  const serviceAccount = `serviceAccount:cloud-iot@system.gserviceaccount.com`;

  topic.iam.getPolicy()
    .then((results) => {
      const policy = results[0] || {};
      policy.bindings || (policy.bindings = []);
      console.log(JSON.stringify(policy, null, 2));

      let hasRole = false;
      let binding = {
        role: 'roles/pubsub.publisher',
        members: [serviceAccount]
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
      return topic.iam.setPolicy(policy);
    })
    .then((results) => {
      const updatedPolicy = results[0];

      console.log(JSON.stringify(updatedPolicy, null, 2));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
}

function createIotTopic (topicName) {
  // Imports the Google Cloud client library
  const PubSub = require('@google-cloud/pubsub');

  // Instantiates a client
  const pubsub = PubSub();

  pubsub.createTopic(topicName)
    .then((results) => {
      setupIotTopic(topicName);
    });
}

// Lookup the registry, assuming that it exists.
function lookupRegistry (client, registryName, cb) {
  const request = {
    name: registryName
  };

  client.projects.locations.registries.get(request, (err, data) => {
    if (err) {
      console.log('Could not look up registry');
      console.log(err);
    } else {
      console.log('Looked up existing registry');
      console.log(data);
    }
  });
}

// Create a new registry, or look up an existing one if it doesn't exist.
function lookupOrCreateRegistry (client, registryId, parentName, pubsubTopic) {
  const request = {
    parent: parentName,
    id: registryId,
    resource: {
      eventNotificationConfig: {
        pubsubTopicName: pubsubTopic
      }
    }
  };

  client.projects.locations.registries.create(request, (err, data) => {
    if (err) {
      if (err.code === 409) {
        // The registry already exists - look it up instead.
        lookupRegistry(client);
      } else {
        console.log('Could not create registry');
        console.log(err);
      }
    } else {
      console.log('Successfully created registry');
      console.log(data);
    }
  });
}

// Create a new device with the given id. The body defines the parameters for
// the device, such as authentication.
function createUnauthDevice (client, deviceId, registryName, body) {
  console.log('Creating device:', deviceId);

  const request = {
    parent: registryName,
    id: deviceId,
    resource: body
  };

  client.projects.locations.registries.devices.create(request, (err, data) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(data);
    }
  });
}

// Create a device using RSA256 for authentication.
function createRsaDevice (client, deviceId, registryName, rsaCertificateFile) {
  const body = {
    credentials: [
      {
        publicKey: {
          format: 'RSA_X509_PEM',
          key: fs.readFileSync(rsaCertificateFile).toString()
        }
      }
    ]
  };

  const request = {
    parent: registryName,
    id: deviceId,
    resource: body
  };

  console.log(JSON.stringify(request));

  client.projects.locations.registries.devices.create(request, (err, data) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(data);
    }
  });
}

// Create a device using ES256 for authentication.
function createEsDevice (client, deviceId, registryName, esCertificateFile) {
  const body = {
    credentials: [
      {
        publicKey: {
          format: 'ES256_PEM',
          key: fs.readFileSync(esCertificateFile).toString()
        }
      }
    ]
  };

  const request = {
    parent: registryName,
    id: deviceId,
    resource: body
  };

  client.projects.locations.registries.devices.create(request, (err, data) => {
    if (err) {
      console.log('Could not create device');
      console.log(err);
    } else {
      console.log('Created device');
      console.log(data);
    }
  });
}

// Add RSA256 authentication to the given device.
function patchRsa256ForAuth (client, deviceId, registryId, rsaPublicKeyFile,
    projectId, cloudRegion) {
  const parentName =
      `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    updateMask: 'credentials',
    resource: {
      credentials: [
        {
          publicKey: {
            format: 'RSA_X509_PEM',
            key: fs.readFileSync(rsaPublicKeyFile).toString()
          }
        }
      ]
    }
  };

  client.projects.locations.registries.devices.patch(request, (err, data) => {
    if (err) {
      console.log('Error patching device:', deviceId);
      console.log(err);
    } else {
      console.log('Patched device:', deviceId);
      console.log(data);
    }
  });
}

// Add ES256 authentication to the given device.
function patchEs256ForAuth (client, deviceId, registryId, esPublicKeyFile,
    projectId, cloudRegion) {
  const parentName =
      `projects/${projectId}/locations/${cloudRegion}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    updateMask: 'credentials',
    resource: {
      credentials: [
        {
          publicKey: {
            format: 'ES256_PEM',
            key: fs.readFileSync(esPublicKeyFile).toString()
          }
        }
      ]
    }
  };

  client.projects.locations.registries.devices.patch(request, (err, data) => {
    if (err) {
      console.log('Error patching device:', deviceId);
      console.log(err);
    } else {
      console.log('Patched device:', deviceId);
      console.log(data);
    }
  });
}

// List all of the devices in the given registry.
function listDevices (client, registryName) {
  const request = {
    parent: registryName
  };

  client.projects.locations.registries.devices.list(request, (err, data) => {
    if (err) {
      console.log('Could not list devices');
      console.log(err);
    } else {
      console.log('Current devices in registry:', data['devices']);
    }
  });
}

// Delete the given device from the registry.
function deleteDevice (client, deviceId, registryName, cb) {
  const request = {
    name: `${registryName}/devices/${deviceId}`
  };

  client.projects.locations.registries.devices.delete(request, (err, data) => {
    if (err) {
      console.log('Could not delete device:', deviceId);
      console.log(err);
    } else {
      console.log('Successfully deleted device:', deviceId);
      console.log(data);
      if (cb) {
        cb();
      }
    }
  });
}

// Clear the given registry by removing all devices and deleting the registry.
function clearRegistry (client, registryName) {
  const requestDelete = {
    name: registryName
  };

  const after = function () {
    client.projects.locations.registries.delete(requestDelete, (err, data) => {
      if (err) {
        console.log('Could not delete registry');
        console.log(err);
      } else {
        console.log(`Successfully deleted registry ${registryName}`);
        console.log(data);
      }
    });
  };

  const request = {
    parent: registryName
  };

  client.projects.locations.registries.devices.list(request, (err, data) => {
    if (err) {
      console.log('Could not list devices');
      console.log(err);
    } else {
      console.log('Current devices in registry:', data['devices']);
      let devices = data['devices'];
      if (devices) {
        devices.forEach((device, index) => {
          console.log(`${device.id} [${index}/${devices.length}] removed`);
          if (index === devices.length - 1) {
            deleteDevice(client, device.id, registryName, after);
          } else {
            deleteDevice(client, device.id, registryName);
          }
        });
      } else {
        after();
      }
    }
  });
}

// Delete the given registry. Note that this will only succeed if the registry
// is empty.
function deleteRegistry (client, registryName) {
  const request = {
    name: registryName
  };

  client.projects.locations.registries.delete(request, (err, data) => {
    if (err) {
      console.log('Could not delete registry');
      console.log(err);
    } else {
      console.log('Successfully deleted registry');
      console.log(data);
    }
  });
}

// Retrieve the given device from the registry.
function getDevice (client, deviceId, registryName) {
  const request = {
    name: `${registryName}/devices/${deviceId}`
  };

  client.projects.locations.registries.devices.get(request, (err, data) => {
    if (err) {
      console.log('Could not delete device:', deviceId);
      console.log(err);
    } else {
      console.log('Found device:', deviceId);
      console.log(data);
    }
  });
}

// Returns an authorized API client by discovering the Cloud IoT Core API with
// the provided API key.
function getClient (apiKey, serviceAccountJson, cb) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountJson));
  const jwtAccess = new google.auth.JWT();
  jwtAccess.fromJSON(serviceAccount);
  // Note that if you require additional scopes, they should be specified as a
  // string, separated by spaces.
  jwtAccess.scopes = 'https://www.googleapis.com/auth/cloud-platform';
  // Set the default authentication to the above JWT access.
  google.options({ auth: jwtAccess });

  const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}&key=${apiKey}`;

  google.discoverAPI(discoveryUrl, {}, (err, client) => {
    if (err) {
      console.log('Error during API discovery', err);
      return undefined;
    }
    cb(client);
  });
}

require(`yargs`) // eslint-disable-line
  .demand(4)
  .options({
    apiKey: {
      alias: 'a',
      default: process.env.API_KEY,
      description: 'The API key used for discoverying the API.',
      requiresArg: true,
      type: 'string'
    },
    cloudRegion: {
      alias: 'c',
      default: 'us-central1',
      requiresArg: true,
      type: 'string'
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description: 'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string'
    },
    serviceAccount: {
      alias: 's',
      default: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      description: 'The path to your service credentials JSON.',
      requiresArg: true,
      type: 'string'
    }
  })
  .command(
    `createRsa256Device <deviceId> <registryId> <rsaPath>`,
    `Creates an RSA256 device.`,
    {},
    (opts) => {
      const cb = function (client) {
        const parentName =
            `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
        const registryName = `${parentName}/registries/${opts.registryId}`;
        createRsaDevice(client, opts.deviceId, registryName, opts.rsaPath);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `createEs256Device <deviceId> <registryId> <esPath>`,
    `Creates an ES256 device.`,
    {},
    (opts) => {
      const cb = function (client) {
        const parentName =
            `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
        const registryName = `${parentName}/registries/${opts.registryId}`;
        createEsDevice(client, opts.deviceId, registryName, opts.esPath);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `createUnauthDevice <deviceId> <registryId>`,
    `Creates a device without authorization.`,
    {},
    (opts) => {
      const cb = function (client) {
        const parentName =
            `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
        const registryName = `${parentName}/registries/${opts.registryId}`;
        createUnauthDevice(client, opts.deviceId, registryName, {});
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `createRegistry <registryId> <pubsubTopic>`,
    `Creates a device registry.`,
    {},
    (opts) => {
      const cb = function (client) {
        const parentName =
            `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
        const pubsubTopic =
            `projects/${opts.projectId}/topics/${opts.pubsubTopic}`;
        lookupOrCreateRegistry(client, opts.registryId, parentName,
            pubsubTopic);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
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
    (opts) => {
      const cb = function (client) {
        const parentName =
            `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
        const registryName = `${parentName}/registries/${opts.registryId}`;
        deleteDevice(client, opts.deviceId, registryName);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `clearRegistry <registryId>`,
    `!!Be careful! Removes all devices and then deletes a device registry!!`,
    {},
    (opts) => {
      const parentName =
          `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
      const registryName = `${parentName}/registries/${opts.registryId}`;
      const cb = function (client) {
        clearRegistry(client, registryName);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `deleteRegistry <registryId>`,
    `Deletes a device registry.`,
    {},
    (opts) => {
      const parentName =
          `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
      const registryName = `${parentName}/registries/${opts.registryId}`;
      const cb = function (client) {
        deleteRegistry(client, registryName);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `getDevice <deviceId> <registryId>`,
    `Retrieves device info given a device ID.`,
    {},
    (opts) => {
      const parentName =
          `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
      const registryName = `${parentName}/registries/${opts.registryId}`;
      const cb = function (client) {
        getDevice(client, opts.deviceId, registryName);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `listDevices <registryId>`,
    `Lists the devices in a given registry.`,
    {},
    (opts) => {
      const parentName =
          `projects/${opts.projectId}/locations/${opts.cloudRegion}`;
      const registryName = `${parentName}/registries/${opts.registryId}`;
      const cb = function (client) { listDevices(client, registryName); };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `patchEs256 <deviceId> <registryId> <es256Path>`,
    `Patches a device with ES256 authorization credentials.`,
    {},
    (opts) => {
      const cb = function (client) {
        patchEs256ForAuth(client, opts.deviceId, opts.registryId,
            opts.es256Path, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .command(
    `patchRsa256 <deviceId> <registryId> <rsa256Path>`,
    `Patches a device with RSA256 authentication credentials.`,
    {},
    (opts) => {
      const cb = function (client) {
        patchRsa256ForAuth(client, opts.deviceId, opts.registryId,
            opts.rsa256Path, opts.projectId, opts.cloudRegion);
      };
      getClient(opts.apiKey, opts.serviceAccount, cb);
    }
  )
  .example(`node $0 createEs256Device my-es-device my-registry ../ec_public.pem --apiKey=abc123zz`)
  .example(`node $0 createRegistry my-registry my-iot-topic --service_account_json=$HOME/creds_iot.json --api_key=abc123zz --project_id=my-project-id`)
  .example(`node $0 createRsa256Device my-rsa-device my-registry ../rsa_cert.pem --apiKey=abc123zz`)
  .example(`node $0 createUnauthDevice my-device my-registry`)
  .example(`node $0 deleteDevice my-device my-registry`)
  .example(`node $0 deleteRegistry my-device my-registry`)
  .example(`node $0 getDevice my-device my-registry`)
  .example(`node $0 listDevices my-node-registry`)
  .example(`node $0 patchRsa256 my-device my-registry ../rsa_cert.pem`)
  .example(`node $0 patchEs256 my-device my-registry ../ec_public.pem`)
  .example(`node $0 setupTopic my-iot-topic --service_account_json=$HOME/creds_iot.json --api_key=abc123zz --project_id=my-project-id`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict()
  .argv;
