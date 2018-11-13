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
// [START iot_http_includes]
const fs = require('fs');
const jwt = require('jsonwebtoken');
const request = require('retry-request');
// [END iot_http_includes]

console.log('Google Cloud IoT Core HTTP example.');
var argv = require(`yargs`)
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
      description: 'Encryption algorithm to generate the RSA or EC JWT.',
      requiresArg: true,
      demandOption: true,
      choices: ['RS256', 'ES256'],
      type: 'string',
    },
    numMessages: {
      default: 100,
      description: 'Number of messages to publish.',
      requiresArg: true,
      type: 'number',
    },
    tokenExpMins: {
      default: 20,
      description: 'Minutes to JWT token expiration.',
      requiresArg: true,
      type: 'number',
    },
    httpBridgeAddress: {
      default: 'cloudiotdevice.googleapis.com',
      description: 'HTTP bridge address.',
      requiresArg: true,
      type: 'string',
    },
    messageType: {
      default: 'events',
      description: 'Message type to publish.',
      requiresArg: true,
      choices: ['events', 'state'],
      type: 'string',
    },
  })
  .example(
    `node $0 cloudiotHttp_example_nodejs.js --projectId=blue-jet-123 --registryId=my-registry --deviceId=my-node-device --privateKeyFile=../rsaPrivate.pem --algorithm=RS256`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;

// [START iot_http_variables]
// A unique string that identifies this device. For Google Cloud IoT Core, it
// must be in the format below.

let iatTime = parseInt(Date.now() / 1000);
let authToken = createJwt(argv.projectId, argv.privateKeyFile, argv.algorithm);
const devicePath = `projects/${argv.projectId}/locations/${
  argv.cloudRegion
}/registries/${argv.registryId}/devices/${argv.deviceId}`;

// The request path, set accordingly depending on the message type.
const pathSuffix =
  argv.messageType === 'events' ? ':publishEvent' : ':setState';
const urlBase = `https://${argv.httpBridgeAddress}/v1/${devicePath}`;
const url = `${urlBase}${pathSuffix}`;
// [END iot_http_variables]

// Create a Cloud IoT Core JWT for the given project ID, signed with the given
// private key.
// [START iot_http_jwt]
function createJwt(projectId, privateKeyFile, algorithm) {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project ID.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
}
// [END iot_http_jwt]

// Publish numMessages message asynchronously, starting from message
// messageCount. Telemetry events are published at a rate of 1 per second and
// states at a rate of 1 every 2 seconds.
// [START iot_http_publish]
function publishAsync(authToken, messageCount, numMessages) {
  const payload = `${argv.registryId}/${argv.deviceId}-payload-${messageCount}`;
  console.log('Publishing message:', payload);
  const binaryData = Buffer.from(payload).toString('base64');
  const postData =
    argv.messageType === 'events'
      ? {
          binary_data: binaryData,
        }
      : {
          state: {
            binary_data: binaryData,
          },
        };

  const options = {
    url: url,
    headers: {
      authorization: `Bearer ${authToken}`,
      'content-type': 'application/json',
      'cache-control': 'no-cache',
    },
    body: postData,
    json: true,
    method: 'POST',
    retries: 5,
    shouldRetryFn: function(incomingHttpMessage) {
      return incomingHttpMessage.statusMessage !== 'OK';
    },
  };

  // Send events for high-frequency updates, update state only occasionally.
  const delayMs = argv.messageType === 'events' ? 1000 : 2000;
  console.log(JSON.stringify(request));
  request(options, function(error, response, body) {
    if (error) {
      console.error('Received error: ', error);
    } else if (response.body.error) {
      console.error('Received error: ' + JSON.stringify(response.body.error));
    } else {
      console.log('Message sent.');
    }
    if (messageCount < numMessages) {
      // If we have published fewer than numMessage messages, publish payload
      // messageCount + 1.
      setTimeout(function() {
        let secsFromIssue = parseInt(Date.now() / 1000) - iatTime;
        if (secsFromIssue > argv.tokenExpMins * 60) {
          iatTime = parseInt(Date.now() / 1000);
          console.log(`\tRefreshing token after ${secsFromIssue} seconds.`);
          authToken = createJwt(
            argv.projectId,
            argv.privateKeyFile,
            argv.algorithm
          );
        }

        publishAsync(authToken, messageCount + 1, numMessages);
      }, delayMs);
    }
  });
}
// [END iot_http_publish]

// [START iot_http_getconfig]
function getConfig(authToken, version) {
  console.log(`Getting config from URL: ${urlBase}`);

  const options = {
    url: urlBase + '/config?local_version=' + version,
    headers: {
      authorization: `Bearer ${authToken}`,
      'content-type': 'application/json',
      'cache-control': 'no-cache',
    },
    json: true,
    retries: 5,
    shouldRetryFn: function(incomingHttpMessage) {
      console.log('Retry?');
      return incomingHttpMessage.statusMessage !== 'OK';
    },
  };
  console.log(JSON.stringify(request.RetryStrategies));
  request(options, function(error, response, body) {
    if (error) {
      console.error('Received error: ', error);
    } else if (response.body.error) {
      console.error(`Received error: ${JSON.stringify(response.body.error)}`);
    } else {
      console.log('Received config', JSON.stringify(body));
    }
  });
}
// [END iot_http_getconfig]

// [START iot_run_http]

// Print latest configuration
getConfig(authToken, 0);

// Publish messages.
publishAsync(authToken, 1, argv.numMessages);
// [END iot_run_http]
