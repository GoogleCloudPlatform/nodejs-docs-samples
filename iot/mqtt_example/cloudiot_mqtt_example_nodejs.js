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

/**
 * NodeJS sample of connecting to Google Cloud IoT Core via MQTT, using JWT.
 *
 * <p>This example connects to Google Cloud IoT Core via MQTT, using a JWT for
 * device authentication. After connecting, by default the device publishes 100
 * messages to the device's MQTT topic at a rate of one per second, and then
 * exits.
 *
 * <p>Before you can run this sample, you must register a device as described
 * in the parent README.
 *
 * <p>Usage example:
 *
 * <pre>
 *   $ npm install
 *   $ nodejs cloudiot_mqtt_example_nodejs.js \
 *       --project_id=my-project-id \
 *       --registry_id=my-registry-id \
 *       --device_id=my-device-id \
 *       --private_key_file=rsa_private.pem \
 *       --algorithm=RS256"
 * </pre>
 */

'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
const program = require('commander');

program.description('Google Cloud IoT Core MQTT example.')
    .option('--project_id <project_id>', 'GCP cloud project name.')
    .option('--registry_id <registry_id>', 'Cloud IoT registry id.')
    .option('--device_id <device_id>', 'Cloud IoT device id.')
    .option('--private_key_file <key_file>', 'Path to private key file.')
    .option(
        '--algorithm <algorithm>',
        'Encryption algorithm to generate the JWT. Either RS256 or ES256')
    .option('--cloud_region [region]', 'GCP cloud region', 'us-central1')
    .option('--num_messages [num]', 'Number of messages to publish.', 100)
    .option(
        '--mqtt_bridge_hostname [hostname]', 'MQTT bridge hostname.',
        'mqtt.googleapis.com')
    .option('--mqtt_bridge_port [port]', 'MQTT bridge port.', 8883)
    .parse(process.argv);

// Create a Cloud IoT Core JWT for the given project id, signed with the given
// private key.
function createJwt (projectId, privateKeyFile, algorithm) {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    'iat': parseInt(Date.now() / 1000),
    'exp': parseInt(Date.now() / 1000) + 20 * 60,  // 20 minutes
    'aud': projectId
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, { algorithm: algorithm });
}

// Publish numMessages messages asynchronously, starting from message
// messageCount.
function publishAsync (messageCount, numMessages) {
  const payload = `${program.registry_id}/${program.device_id}-payload-${messageCount}`;
  // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
  // Cloud IoT Core also supports qos=0 for at most once delivery.
  console.log('Publishing message:', payload);
  client.publish(mqttTopic, payload, { qos: 1 });

  if (messageCount < numMessages) {
    // If we have published fewer than numMessage messages, publish payload
    // messageCount + 1 in 1 second.
    setTimeout(function () {
      publishAsync(messageCount + 1, numMessages);
    }, 1000);
  } else {
    // Otherwise, close the connection.
    console.log('Closing connection to MQTT. Goodbye!');
    client.end();
  }
}

// The mqttClientId is a unique string that identifies this device. For Google
// Cloud IoT Core, it must be in the format below.
const mqttClientId = `projects/${program.project_id}/locations/${program.cloud_region}/registries/${program.registry_id}/devices/${program.device_id}`;

// With Google Cloud IoT Core, the username field is ignored, however it must be
// non-empty. The password field is used to transmit a JWT to authorize the
// device. The "mqtts" protocol causes the library to connect using SSL, which
// is required for Cloud IoT Core.
const connectionArgs = {
  host: program.mqtt_bridge_hostname,
  port: program.mqtt_bridge_port,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(program.project_id, program.private_key_file, program.algorithm),
  protocol: 'mqtts'
};

// Create a client, and connect to the Google MQTT bridge.
const client = mqtt.connect(connectionArgs);

// The MQTT topic that this device will publish telemetry data to. The MQTT
// topic name is required to be in the format below. Note that this is not the
// same as the device registry's Cloud Pub/Sub topic.
const mqttTopic = `/devices/${program.device_id}/events`;

client.on('connect', () => {
  console.log('connect', arguments);
  // After connecting, publish 'num_messages' messagse asynchronously, at a rate
  // of 1 per second.
  publishAsync(1, program.num_messages);
});

client.on('close', () => {
  console.log('close', arguments);
});

client.on('error', () => {
  console.log('error', arguments);
});

client.on('packetsend', () => {
  console.log('packetsend', arguments);
});

// Once all of the messages have been published, the connection to Google Cloud
// IoT will be closed and the process will exit. See the publishAsync method.
