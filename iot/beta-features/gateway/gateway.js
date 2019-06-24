/**
 * Copyright 2018 Google LLC
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

// [START iot_gateway_include]
const fs = require('fs');
const {google} = require('googleapis');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
// [END iot_gateway_include]

// [START iot_gateway_client_config]
const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

// Returns an authorized API client by discovering the Cloud IoT Core API with
// the provided API key.
const getClient = async () => {
  const authClient = await google.auth.getClient({
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
// [END iot_gateway_client_config]

// [START iot_gateway_client_backoff_variables]
// The initial backoff time after a disconnection occurs, in seconds.
const MINIMUM_BACKOFF_TIME = 1;

// The maximum backoff time before giving up, in seconds.
const MAXIMUM_BACKOFF_TIME = 32;

// Whether to wait with exponential backoff before publishing.
let shouldBackoff = false;

// The current backoff time.
let backoffTime = 1;

// Whether an asynchronous publish chain is in progress
let publishChainInProgress = false;

// [END iot_gateway_client_backoff_variables]

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
// [START iot_mqtt_jwt]
const createJwt = (projectId, privateKeyFile, algorithm) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
};
// [END iot_mqtt_jwt]

// Creates a gateway.
const createGateway = (
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId,
  certificateFile,
  algorithm
) => {
  // [START create_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  console.log('Creating gateway:', gatewayId);

  const certFormat = algorithm === 'ES256' ? 'ES256_PEM' : 'RSA_X509_PEM';

  console.log(certFormat);

  const createRequest = {
    parent: parentName,
    resource: {
      id: gatewayId,
      credentials: [
        {
          publicKey: {
            format: certFormat,
            key: fs.readFileSync(certificateFile).toString(),
          },
        },
      ],
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
  // [END create_gateway]
};

// Creates a device to bind to a gateway.
const createDeviceForGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) => {
  // [START create_device]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;
  const getRequest = {
    name: `${parentName}/devices/${deviceId}`,
  };

  let exists = false;
  let device = {};
  try {
    const {data} = await client.projects.locations.registries.devices.get(
      getRequest
    );
    console.log('Device exists');
    device = data;
    exists = true;
  } catch (err) {
    // Device not found
    console.log('Error while getting device', err);
  }

  if (exists) {
    return device;
  } else {
    console.log('Creating device:', deviceId);

    const createRequest = {
      parent: parentName,
      resource: {
        id: deviceId,
        gatewayConfig: {
          gatewayType: 'NON_GATEWAY',
          gatewayAuthMethod: 'ASSOCIATION_ONLY',
        },
      },
    };

    try {
      const {data} = await client.projects.locations.registries.devices.create(
        createRequest
      );
      console.log('Created device');
      device = data;
      console.log(device);
      return device;
    } catch (err) {
      console.log('Could not create device');
      console.log(err);
    }
  }
  // [END create_device]
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
  // [START bind_device_to_gateway]
  // const cloudRegion = 'us-central1';
  // const deviceId = 'my-unauth-device';
  // const gatewayId = 'my-gateway';
  // const projectId = 'adjective-noun-123';
  // const registryId = 'my-registry';
  const device = await createDeviceForGateway(
    client,
    projectId,
    cloudRegion,
    registryId,
    deviceId,
    gatewayId
  );

  console.log(`Binding device: ${JSON.stringify(device.id)}`);
  const parentName = `projects/${projectId}/locations/${cloudRegion}/registries/${registryId}`;

  const bindRequest = {
    parent: parentName,
    deviceId: device.id,
    gatewayId: gatewayId,
  };

  try {
    await client.projects.locations.registries.bindDeviceToGateway(bindRequest);
    console.log('Bound device to', gatewayId);
  } catch (err) {
    console.log('Could not bind device', err);
  }
  // [END bind_device_to_gateway]
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
  // [START unbind_device_to_gateway]
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
    console.log('Device no longer bound.');
  } catch (err) {
    console.log('Could not unbind device', err);
  }
  // [END unbind_device_to_gateway]
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
      let gateways = [];
      try {
        const {data} = await client.projects.locations.registries.devices.list(
          listGatewaysForDeviceRequest
        );

        if (data.devices && data.devices.length > 0) {
          gateways = data.devices;
        }
      } catch (err) {
        console.error('Could not list gateways', err);
        return;
      }

      const promises = gateways.map(gateway => {
        const unbindRequest = {
          parent: registryName,
          deviceId: device.id,
          gatewayId: gateway.id,
        };

        // for each gateway, make the call to unbind it
        return client.projects.locations.registries.unbindDeviceFromGateway(
          unbindRequest
        );
      });

      await Promise.all(promises);
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

    if (!data) {
      return;
    }

    devices = data.devices;
  } catch (err) {
    console.error('Could not list devices', err);
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

    await Promise.all(promises);
  }
};

// Lists gateways in a registry.
const listGateways = async (client, projectId, cloudRegion, registryId) => {
  // [START list_gateways]
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
  // [END list_gateways]
};

// Lists devices bound to a gateway.
const listDevicesForGateway = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  gatewayId
) => {
  // [START list_devices_for_gateway]
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
  // [END list_devices_for_gateway]
};

// Lists gateways a given device is bound to.
const listGatewaysForDevice = async (
  client,
  projectId,
  cloudRegion,
  registryId,
  deviceId
) => {
  // [START list_gateways_for_device]
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
  // [END list_gateways_for_device]
};

// Attaches a device to a gateway.
const attachDevice = async (deviceId, client) => {
  // [START attach_device]
  // const deviceId = 'my-unauth-device';
  const attachTopic = `/devices/${deviceId}/attach`;
  console.log(`Attaching: ${attachTopic}`);
  const attachPayload = '{}';

  try {
    await client.publish(attachTopic, attachPayload, {qos: 1});

    shouldBackoff = false;
    backoffTime = MINIMUM_BACKOFF_TIME;
  } catch (err) {
    console.log(err);
  }
  // [END attach_device]
};

// Detaches a device from a gateway.
const detachDevice = async (deviceId, client) => {
  // [START detach_device]
  const detachTopic = `/devices/${deviceId}/detach`;
  console.log(`Detaching: ${detachTopic}`);
  const detachPayload = '{}';

  try {
    await client.publish(detachTopic, detachPayload, {qos: 1});

    shouldBackoff = false;
    backoffTime = MINIMUM_BACKOFF_TIME;
  } catch (err) {
    console.log(err);
  }
  // [END detach_device]
};

// Listen for configuration messages on a gateway and bound device.
const listenForConfigMessages = (
  gatewayId,
  deviceId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  clientDuration
) => {
  // [START listen_for_config_messages]
  // const parentName = `projects/${projectId}/locations/${region}`;
  // const registryName = `${parentName}/registries/${registryId}`;

  const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${gatewayId}`;
  console.log(mqttClientId);
  const connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    qos: 1,
    secureProtocol: 'TLSv1_2_method',
  };

  // Create a client, and connect to the Google MQTT bridge.
  const client = mqtt.connect(connectionArgs);

  client.on('connect', success => {
    if (!success) {
      console.log('Client not connected...');
    } else {
      console.log('Client connected: Gateway is listening, attaching device');
      attachDevice(deviceId, client);

      setTimeout(() => {
        // Subscribe to any configuration topics.
        client.subscribe(`/devices/${gatewayId}/config`, {qos: 1});
        client.subscribe(`/devices/${deviceId}/config`, {qos: 1});

        setTimeout(() => {
          detachDevice(deviceId, client);
          console.log('Closing connection to MQTT. Goodbye!');
          client.end(true);
        }, clientDuration); // Safely detach device and close connection.
      }, 5000);
    }
  });

  client.on('close', () => {
    console.log('Connection closed');
    shouldBackoff = true;
  });

  client.on('error', err => {
    console.log('error', err);
  });

  client.on('message', (topic, message) => {
    const decodedMessage = Buffer.from(message, 'base64').toString('ascii');

    if (topic === `/devices/${gatewayId}/errors`) {
      console.log(`message received on error topic: ${decodedMessage}`);
    } else {
      console.log(`message received on topic ${topic}: ${decodedMessage}`);
    }
  });

  client.on('packetsend', () => {
    // Note: logging packet send is very verbose
  });
  // [END listen_for_config_messages]
};

// Listen for error messages on a gateway.
const listenForErrorMessages = (
  gatewayId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  clientDuration,
  deviceId
) => {
  // [START listen_for_error_messages]
  // const parentName = `projects/${projectId}/locations/${region}`;
  // const registryName = `${parentName}/registries/${registryId}`;

  const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${gatewayId}`;
  console.log(mqttClientId);
  const connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    qos: 1,
    secureProtocol: 'TLSv1_2_method',
  };

  // Create a client, and connect to the Google MQTT bridge.
  const client = mqtt.connect(connectionArgs);

  client.on('connect', success => {
    if (!success) {
      console.log('Client not connected...');
    } else {
      setTimeout(() => {
        // Subscribe to gateway error topic.
        client.subscribe(`/devices/${gatewayId}/errors`, {qos: 0});

        attachDevice(deviceId, client);

        setTimeout(() => {
          console.log('Closing connection to MQTT. Goodbye!');
          client.end(true);
        }, clientDuration); // Safely detach device and close connection.
      }, 5000);
    }
  });

  client.on('close', () => {
    console.log('Connection closed');
    shouldBackoff = true;
  });

  client.on('error', err => {
    console.log('error', err);
  });

  client.on('message', (topic, message) => {
    const decodedMessage = Buffer.from(message, 'base64').toString('ascii');

    console.log(`message received on error topic ${topic}: ${decodedMessage}`);
  });

  client.on('packetsend', () => {
    // Note: logging packet send is very verbose
  });
  // [END listen_for_error_messages]
};

// Sends telemetry on behalf of a device.
const sendDataFromBoundDevice = (
  gatewayId,
  deviceId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  numMessages,
  tokenExpMins
) => {
  // [START iot_send_delegate_data]
  // const parentName = `projects/${projectId}/locations/${region}`;
  // const registryName = `${parentName}/registries/${registryId}`;
  // const binaryData = Buffer.from(data).toString('base64');
  // const request = {
  //   name: `${registryName}/devices/${deviceId}`,
  //   binaryData: binaryData
  // };

  const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${gatewayId}`;
  console.log(`MQTT client id: ${mqttClientId}`);
  const connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    qos: 1,
    secureProtocol: 'TLSv1_2_method',
  };

  // Create a client, and connect to the Google MQTT bridge.
  const iatTime = parseInt(Date.now() / 1000);
  const client = mqtt.connect(connectionArgs);

  client.on('connect', success => {
    if (!success) {
      console.log('Client not connected...');
    } else if (!publishChainInProgress) {
      console.log('Client connected: Attaching device');
      attachDevice(deviceId, client);
      setTimeout(() => {
        console.log('Client connected: Gateway is ready to relay');
        publishAsync(
          client,
          iatTime,
          tokenExpMins,
          0,
          numMessages,
          registryId,
          deviceId,
          gatewayId,
          connectionArgs,
          projectId,
          privateKeyFile,
          algorithm
        );
      }, 5000);
    }
  });

  client.on('close', () => {
    console.log('Connection closed');
    shouldBackoff = true;
  });

  client.on('error', err => {
    console.log('error', err);
  });

  client.on('message', (topic, message) => {
    console.log(
      'message received: ',
      Buffer.from(message, 'base64').toString('ascii')
    );
  });

  client.on('packetsend', () => {
    // Note: logging packet send is very verbose
  });
  // [END iot_send_delegate_data]
};

// Publish numMessages messages asynchronously, starting from message
// messagesSent.
const publishAsync = (
  client,
  iatTime,
  tokenExpMins,
  messagesSent,
  numMessages,
  registryId,
  deviceId,
  gatewayId,
  connectionArgs,
  projectId,
  privateKeyFile,
  algorithm
) => {
  // [START iot_mqtt_publish]
  // If we have published enough messages or backed off too many times, stop.
  if (messagesSent > numMessages || backoffTime >= MAXIMUM_BACKOFF_TIME) {
    if (backoffTime >= MAXIMUM_BACKOFF_TIME) {
      console.log('Backoff time is too high. Giving up.');
    }
    if (messagesSent >= numMessages) {
      detachDevice(deviceId, client);
    }
    console.log('Closing connection to MQTT. Goodbye!');
    client.end();
    publishChainInProgress = false;
    return;
  }

  // Publish and schedule the next publish.
  publishChainInProgress = true;
  let publishDelayMs = 0;
  if (shouldBackoff) {
    publishDelayMs = 1000 * (backoffTime + Math.random());
    backoffTime *= 2;
    console.log(`Backing off for ${publishDelayMs}ms before publishing.`);
  }
  let mqttTopic = `/devices/${gatewayId}/state`;
  let payload = `${registryId}/${gatewayId}-connected-${new Date().getTime()}`;
  console.log(`Publishing message ${messagesSent}/${numMessages}`);
  if (messagesSent > 0) {
    mqttTopic = `/devices/${deviceId}/state`;
    payload = `${registryId}/${deviceId}-payload-${messagesSent}`;
  }

  setTimeout(() => {
    // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    console.log(`Publishing message: ${payload} to ${mqttTopic}`);
    client.publish(mqttTopic, payload, {qos: 1}, err => {
      if (!err) {
        shouldBackoff = false;
        backoffTime = MINIMUM_BACKOFF_TIME;
      }
    });

    const schedulePublishDelayMs = 5000; // messageType === 'events' ? 1000 : 2000;
    setTimeout(() => {
      // [START iot_mqtt_jwt_refresh]
      const secsFromIssue = parseInt(Date.now() / 1000) - iatTime;
      if (secsFromIssue > tokenExpMins * 60) {
        iatTime = parseInt(Date.now() / 1000);
        console.log(`\tRefreshing token after ${secsFromIssue} seconds.`);

        client.end();
        connectionArgs.password = createJwt(
          projectId,
          privateKeyFile,
          algorithm
        );
        client = mqtt.connect(connectionArgs);
      }
      // [END iot_mqtt_jwt_refresh]
      publishAsync(
        client,
        iatTime,
        tokenExpMins,
        messagesSent + 1,
        numMessages,
        registryId,
        deviceId,
        gatewayId
      );
    }, schedulePublishDelayMs);
  }, publishDelayMs);
  // [END iot_mqtt_publish]
};

let argv = require(`yargs`) // eslint-disable-line
  .demandCommand(1, 'You need at least one command before moving on')
  .options({
    algorithm: {
      default: 'RS256',
      description: 'Encryption algorithm to generate the JWT.',
      requiresArg: true,
      demandOption: true,
      choices: ['RS256', 'ES256'],
      type: 'string',
    },
    clientDuration: {
      default: 60000,
      description: 'Duration in milliseconds for MQTT client to run',
      requiresArg: true,
      type: 'number',
    },
    cloudRegion: {
      alias: 'c',
      default: 'us-central1',
      requiresArg: true,
      type: 'string',
    },
    deviceId: {
      description: 'Cloud IoT device ID.',
      requiresArg: false,
      demandOption: false,
      type: 'string',
    },
    gatewayId: {
      description: 'Cloud IoT gateway ID.',
      requiresArg: false,
      demandOption: false,
      type: 'string',
    },
    mqttBridgePort: {
      default: 8883,
      description: 'MQTT bridge port.',
      requiresArg: true,
      type: 'number',
    },
    mqttBridgeHostname: {
      default: 'mqtt.googleapis.com',
      description: 'MQTT bridge hostname.',
      requiresArg: true,
      type: 'string',
    },
    privateKeyFile: {
      description: 'Path to private key file.',
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
    tokenExpMins: {
      default: 20,
      description: 'Minutes to JWT token expiration.',
      requiresArg: true,
      type: 'number',
    },
  })

  .command(
    `createGateway <registryId> <gatewayId> <algorithm> <publicKeyFile>`,
    `Creates a gateway`,
    {},
    async opts => {
      const client = await getClient(opts.serviceAccount);
      await createGateway(
        client,
        opts.projectId,
        opts.cloudRegion,
        opts.registryId,
        opts.gatewayId,
        opts.publicKeyFile,
        opts.algorithm
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
  .command(
    `listen <deviceId> <gatewayId> <registryId> <privateKeyFile>`,
    `Listens for configuration changes on a gateway and bound device.`,
    {},
    opts => {
      listenForConfigMessages(
        opts.gatewayId,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.algorithm,
        opts.privateKeyFile,
        opts.mqttBridgeHostname,
        opts.mqttBridgePort,
        opts.clientDuration
      );
    }
  )
  .command(
    `listenForErrors <gatewayId> <registryId> <deviceId> <privateKeyFile>`,
    `Listens for error messages on a gateway.`,
    {},
    opts => {
      listenForErrorMessages(
        opts.gatewayId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.algorithm,
        opts.privateKeyFile,
        opts.mqttBridgeHostname,
        opts.mqttBridgePort,
        opts.clientDuration,
        opts.deviceId
      );
    }
  )
  .command(
    `relayData <deviceId> <gatewayId> <registryId> <privateKeyFile>`,
    `Sends data on behalf of a bound device.`,
    {
      numMessages: {
        default: 5,
        description: 'Number of messages to publish.',
        requiresArg: true,
        type: 'number',
      },
    },
    opts => {
      sendDataFromBoundDevice(
        opts.gatewayId,
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.algorithm,
        opts.privateKeyFile,
        opts.mqttBridgeHostname,
        opts.mqttBridgePort,
        opts.numMessages,
        opts.tokenExpMins
      );
    }
  )
  .example(`node $0 relayData my-device my-registry "test"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;
