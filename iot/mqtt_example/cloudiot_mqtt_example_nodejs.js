/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START iot_mqtt_include]
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
// [END iot_mqtt_include]

// The initial backoff time after a disconnection occurs, in seconds.
const MINIMUM_BACKOFF_TIME = 1;

// The maximum backoff time before giving up, in seconds.
const MAXIMUM_BACKOFF_TIME = 32;

// Whether to wait with exponential backoff before publishing.
let shouldBackoff = false;

// The current backoff time.
let backoffTime = 1;

// Whether an asynchronous publish chain is in progress.
let publishChainInProgress = false;

console.log('Google Cloud IoT Core MQTT example.');
const argv = require(`yargs`)
  .options({
    projectId: {
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
    cloudRegion: {
      default: 'us-central1',
      description: 'GCP cloud region.',
      requiresArg: true,
      type: 'string',
    },
    registryId: {
      description: 'Cloud IoT registry ID.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    deviceId: {
      description: 'Cloud IoT device ID.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    privateKeyFile: {
      description: 'Path to private key file.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    algorithm: {
      description: 'Encryption algorithm to generate the JWT.',
      requiresArg: true,
      demandOption: true,
      choices: ['RS256', 'ES256'],
      type: 'string',
    },
    tokenExpMins: {
      default: 20,
      description: 'Minutes to JWT token expiration.',
      requiresArg: true,
      type: 'number',
    },
    mqttBridgeHostname: {
      default: 'mqtt.googleapis.com',
      description: 'MQTT bridge hostname.',
      requiresArg: true,
      type: 'string',
    },
    mqttBridgePort: {
      default: 8883,
      description: 'MQTT bridge port.',
      requiresArg: true,
      type: 'number',
    },
  })
  .command(
    `mqttDeviceDemo`,
    `Connects a device, sends data, and receives data`,
    {
      messageType: {
        default: 'events',
        description: 'Message type to publish.',
        requiresArg: true,
        choices: ['events', 'state'],
        type: 'string',
      },
      numMessages: {
        default: 10,
        description: 'Number of messages to publish.',
        demandOption: true,
        type: 'number',
      },
    },
    opts => {
      mqttDeviceDemo(
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.algorithm,
        opts.privateKeyFile,
        opts.mqttBridgeHostname,
        opts.mqttBridgePort,
        opts.messageType,
        opts.numMessages
      );
    }
  )
  .command(
    `sendDataFromBoundDevice`,
    `Sends data from a gateway on behalf of a bound device.`,
    {
      gatewayId: {
        description: 'Cloud IoT gateway ID.',
        requiresArg: true,
        demandOption: true,
        type: 'string',
      },
      numMessages: {
        default: 10,
        description: 'Number of messages to publish.',
        demandOption: true,
        type: 'number',
      },
    },
    opts => {
      sendDataFromBoundDevice(
        opts.deviceId,
        opts.gatewayId,
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
  .command(
    `listenForConfigMessages`,
    `Listens for configuration changes on a gateway and bound device.`,
    {
      gatewayId: {
        description: 'Cloud IoT gateway ID.',
        requiresArg: true,
        demandOption: true,
        type: 'string',
      },
      clientDuration: {
        default: 60000,
        description: 'Duration in milliseconds for MQTT client to run.',
        requiresArg: true,
        type: 'number',
      },
    },
    opts => {
      listenForConfigMessages(
        opts.deviceId,
        opts.gatewayId,
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
    `listenForErrorMessages`,
    `Listens for error messages on a gateway.`,
    {
      gatewayId: {
        description: 'Cloud IoT gateway ID.',
        requiresArg: true,
        demandOption: true,
        type: 'string',
      },
      clientDuration: {
        default: 60000,
        description: 'Duration in milliseconds for MQTT client to run.',
        requiresArg: true,
        type: 'number',
      },
    },
    opts => {
      listenForErrorMessages(
        opts.deviceId,
        opts.gatewayId,
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
  .example(
    `node $0 mqttDeviceDemo --projectId=blue-jet-123 \\\n\t--registryId=my-registry --deviceId=my-node-device \\\n\t--privateKeyFile=../rsa_private.pem --algorithm=RS256 \\\n\t--cloudRegion=us-central1 --numMessages=10 \\\n`
  )
  .example(
    `node $0 sendDataFromBoundDevice --projectId=blue-jet-123 \\\n\t--registryId=my-registry --deviceId=my-node-device \\\n\t--privateKeyFile=../rsa_private.pem --algorithm=RS256 \\\n\t--cloudRegion=us-central1 --gatewayId=my-node-gateway \\\n`
  )
  .example(
    `node $0 listenForConfigMessages --projectId=blue-jet-123 \\\n\t--registryId=my-registry --deviceId=my-node-device \\\n\t--privateKeyFile=../rsa_private.pem --algorithm=RS256 \\\n\t--cloudRegion=us-central1 --gatewayId=my-node-gateway \\\n\t--clientDuration=300000 \\\n`
  )
  .example(
    `node $0 listenForErrorMessages --projectId=blue-jet-123 \\\n\t--registryId=my-registry --deviceId=my-node-device \\\n\t--privateKeyFile=../rsa_private.pem --algorithm=RS256 \\\n\t--cloudRegion=us-central1 --gatewayId=my-node-gateway \\\n\t--clientDuration=300000 \\\n`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
// [START iot_mqtt_jwt]
function createJwt(projectId, privateKeyFile, algorithm) {
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
}
// [END iot_mqtt_jwt]

// Publish numMessages messages asynchronously, starting from message
// messagesSent.
// [START iot_mqtt_publish]
function publishAsync(
  mqttTopic,
  client,
  iatTime,
  messagesSent,
  numMessages,
  connectionArgs
) {
  // If we have published enough messages or backed off too many times, stop.
  if (messagesSent > numMessages || backoffTime >= MAXIMUM_BACKOFF_TIME) {
    if (backoffTime >= MAXIMUM_BACKOFF_TIME) {
      console.log('Backoff time is too high. Giving up.');
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

  setTimeout(() => {
    const payload = `${argv.registryId}/${
      argv.deviceId
    }-payload-${messagesSent}`;

    // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
    // Cloud IoT Core also supports qos=0 for at most once delivery.
    console.log('Publishing message:', payload);
    client.publish(mqttTopic, payload, {qos: 1}, err => {
      if (!err) {
        shouldBackoff = false;
        backoffTime = MINIMUM_BACKOFF_TIME;
      }
    });

    const schedulePublishDelayMs = argv.messageType === 'events' ? 1000 : 2000;
    setTimeout(() => {
      // [START iot_mqtt_jwt_refresh]
      const secsFromIssue = parseInt(Date.now() / 1000) - iatTime;
      if (secsFromIssue > argv.tokenExpMins * 60) {
        iatTime = parseInt(Date.now() / 1000);
        console.log(`\tRefreshing token after ${secsFromIssue} seconds.`);

        client.end();
        connectionArgs.password = createJwt(
          argv.projectId,
          argv.privateKeyFile,
          argv.algorithm
        );
        connectionArgs.protocolId = 'MQTT';
        connectionArgs.protocolVersion = 4;
        connectionArgs.clean = true;
        client = mqtt.connect(connectionArgs);
        // [END iot_mqtt_jwt_refresh]

        client.on('connect', success => {
          console.log('connect');
          if (!success) {
            console.log('Client not connected...');
          } else if (!publishChainInProgress) {
            publishAsync(
              mqttTopic,
              client,
              iatTime,
              messagesSent,
              numMessages,
              connectionArgs
            );
          }
        });

        client.on('close', () => {
          console.log('close');
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
      }
      publishAsync(
        mqttTopic,
        client,
        iatTime,
        messagesSent + 1,
        numMessages,
        connectionArgs
      );
    }, schedulePublishDelayMs);
  }, publishDelayMs);
}
// [END iot_mqtt_publish]

function mqttDeviceDemo(
  deviceId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  messageType,
  numMessages
) {
  // [START iot_mqtt_run]

  // const deviceId = `myDevice`;
  // const registryId = `myRegistry`;
  // const region = `us-central1`;
  // const algorithm = `RS256`;
  // const privateKeyFile = `./rsa_private.pem`;
  // const mqttBridgeHostname = `mqtt.googleapis.com`;
  // const mqttBridgePort = 8883;
  // const messageType = `events`;
  // const numMessages = 5;

  // The mqttClientId is a unique string that identifies this device. For Google
  // Cloud IoT Core, it must be in the format below.
  const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;

  // With Google Cloud IoT Core, the username field is ignored, however it must be
  // non-empty. The password field is used to transmit a JWT to authorize the
  // device. The "mqtts" protocol causes the library to connect using SSL, which
  // is required for Cloud IoT Core.
  const connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    secureProtocol: 'TLSv1_2_method',
  };

  // Create a client, and connect to the Google MQTT bridge.
  const iatTime = parseInt(Date.now() / 1000);
  const client = mqtt.connect(connectionArgs);

  // Subscribe to the /devices/{device-id}/config topic to receive config updates.
  // Config updates are recommended to use QoS 1 (at least once delivery)
  client.subscribe(`/devices/${deviceId}/config`, {qos: 1});

  // Subscribe to the /devices/{device-id}/commands/# topic to receive all
  // commands or to the /devices/{device-id}/commands/<subfolder> to just receive
  // messages published to a specific commands folder; we recommend you use
  // QoS 0 (at most once delivery)
  client.subscribe(`/devices/${deviceId}/commands/#`, {qos: 0});

  // The MQTT topic that this device will publish data to. The MQTT topic name is
  // required to be in the format below. The topic name must end in 'state' to
  // publish state and 'events' to publish telemetry. Note that this is not the
  // same as the device registry's Cloud Pub/Sub topic.
  const mqttTopic = `/devices/${deviceId}/${messageType}`;

  client.on('connect', success => {
    console.log('connect');
    if (!success) {
      console.log('Client not connected...');
    } else if (!publishChainInProgress) {
      publishAsync(mqttTopic, client, iatTime, 1, numMessages, connectionArgs);
    }
  });

  client.on('close', () => {
    console.log('close');
    shouldBackoff = true;
  });

  client.on('error', err => {
    console.log('error', err);
  });

  client.on('message', (topic, message) => {
    let messageStr = 'Message received: ';
    if (topic === `/devices/${deviceId}/config`) {
      messageStr = 'Config message received: ';
    } else if (topic === `/devices/${deviceId}/commands`) {
      messageStr = 'Command message received: ';
    }

    messageStr += Buffer.from(message, 'base64').toString('ascii');
    console.log(messageStr);
  });

  client.on('packetsend', () => {
    // Note: logging packet send is very verbose
  });

  // Once all of the messages have been published, the connection to Google Cloud
  // IoT will be closed and the process will exit. See the publishAsync method.
  // [END iot_mqtt_run]
}

// Attaches a device to a gateway.
function attachDevice(deviceId, client, jwt) {
  // [START attach_device]
  // const deviceId = 'my-unauth-device';
  const attachTopic = `/devices/${deviceId}/attach`;
  console.log(`Attaching: ${attachTopic}`);
  let attachPayload = '{}';
  if (jwt && jwt !== '') {
    attachPayload = `{ 'authorization' : ${jwt} }`;
  }

  client.publish(attachTopic, attachPayload, {qos: 1}, err => {
    if (!err) {
      shouldBackoff = false;
      backoffTime = MINIMUM_BACKOFF_TIME;
    } else {
      console.log(err);
    }
  });
  // [END attach_device]
}

// Detaches a device from a gateway.
function detachDevice(deviceId, client, jwt) {
  // [START detach_device]
  const detachTopic = `/devices/${deviceId}/detach`;
  console.log(`Detaching: ${detachTopic}`);
  let detachPayload = '{}';
  if (jwt && jwt !== '') {
    detachPayload = `{ 'authorization' : ${jwt} }`;
  }

  client.publish(detachTopic, detachPayload, {qos: 1}, err => {
    if (!err) {
      shouldBackoff = false;
      backoffTime = MINIMUM_BACKOFF_TIME;
    } else {
      console.log(err);
    }
  });
  // [END detach_device]
}

// Publish numMessages messages asynchronously through a gateway client connection
function publishAsyncGateway(
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
) {
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
      publishAsyncGateway(
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
}

// Sends data from a gateway on behalf of a device that is bound to that gateway.
function sendDataFromBoundDevice(
  deviceId,
  gatewayId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  numMessages,
  tokenExpMins
) {
  // [START iot_send_data_from_bound_device]
  // const deviceId = `myDevice`;
  // const gatewayId = `mygateway`;
  // const registryId = `myRegistry`;
  // const region = `us-central1`;
  // const algorithm = `RS256`;
  // const privateKeyFile = `./rsa_private.pem`;
  // const mqttBridgeHostname = `mqtt.googleapis.com`;
  // const mqttBridgePort = 8883;
  // const numMessages = 5;
  // const tokenExpMins = 60;

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
        publishAsyncGateway(
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
  // [END iot_send_data_from_bound_device]
}

// Listen for configuration messages on a gateway and bound device.
function listenForConfigMessages(
  deviceId,
  gatewayId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  clientDuration
) {
  // [START iot_listen_for_config_messages]
  // const deviceId = `myDevice`;
  // const gatewayId = `mygateway`;
  // const registryId = `myRegistry`;
  // const region = `us-central1`;
  // const algorithm = `RS256`;
  // const privateKeyFile = `./rsa_private.pem`;
  // const mqttBridgeHostname = `mqtt.googleapis.com`;
  // const mqttBridgePort = 8883;
  // const clientDuration = 60000;

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
  // [END iot_listen_for_config_messages]
}

// Listen for error messages on a gateway.
function listenForErrorMessages(
  deviceId,
  gatewayId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  clientDuration
) {
  // [START iot_listen_for_error_messages]
  // const deviceId = `myDevice`;
  // const gatewayId = `mygateway`;
  // const registryId = `myRegistry`;
  // const projectId = `my-project-123`;
  // const region = `us-central1`;
  // const algorithm = `RS256`;
  // const privateKeyFile = `./rsa_private.pem`;
  // const mqttBridgeHostname = `mqtt.googleapis.com`;
  // const mqttBridgePort = 8883;
  // const clientDuration = 60000;

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
  // [END iot_listen_for_error_messages]
}
