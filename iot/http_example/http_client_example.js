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

/** NodeJS sample of connecting to Google Cloud IoT Core via HTTP. */

'use strict';

const fs = require('fs');
const google = require('googleapis');
const jwt = require('jsonwebtoken');

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
function publishAsync (bearer, client, messageCount, message, projectId, cloudRegion, registryId, deviceId) {
  const path = 'projects/' + projectId + '/locations/' + cloudRegion +
      '/registries/' + registryId + '/devices/' + deviceId;

  // Publish "payload" to the MQTT topic. qos=1 means at least once delivery.
  // Cloud IoT Core also supports qos=0 for at most once delivery.
  console.log('Publishing to:', path);
  console.log('Publishing message:', message);

  // TODO: Publish message hurr
  let request = {
    name: path,
    headers : [{'Authorization': 'Bearer ' + bearer}]
  };
  client.projects.locations.registries.devices.publishEvent(request, function(res){console.log(res);});
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .options({
    deviceId: {
      alias: 'd',
      description: 'The ID used to register this device.',
      type: 'string'
    },
    cloudRegion: {
      alias: 'c',
      default: 'us-central1',
      type: 'string'
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description: 'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      type: 'string'
    },
    registryId: {
      alias: 'r',
      description: 'The identifier for your device registry.',
      type: 'string'
    },
    rsaPath: {
      alias: 'rsa',
      description: 'The file path for your RSA private key.',
      requiresArg: true,
      type: 'string'
    }
  })
  .command(
    `publish <message> <count>`,
    `publishes a message`,
    {},
    (opts) => {
      let bearer = createJwt(opts.projectId, opts.rsaPath, 'RS256');
      console.log(bearer);
      google.discoverAPI(`cloudiot.rest.json`,
          {auth: bearer}, (err, client) => {
        if (err) {
          console.log('Error during API discovery', err);
          return undefined;
        }
        // cb(client)
        publishAsync(bearer, client, opts.messageCount, opts.message,
            opts.projectId, opts.cloudRegion, opts.registryId, opts.deviceId);
      });
    })
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict()
  .argv;
