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
'use strict';

const {google} = require('googleapis');

const API_VERSION = 'v1';
const DISCOVERY_API = 'https://cloudiot.googleapis.com/$discovery/rest';

function sendCommand(deviceId, registryId, projectId, region, command) {
  // [START iot_send_command]
  const parentName = `projects/${projectId}/locations/${region}`;
  const registryName = `${parentName}/registries/${registryId}`;
  const binaryData = Buffer.from(command).toString('base64');
  const request = {
    name: `${registryName}/devices/${deviceId}`,
    binaryData: binaryData,
  };

  google.auth.getClient().then(authClient => {
    const discoveryUrl = `${DISCOVERY_API}?version=${API_VERSION}`;
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform',
      ]);
    }

    google.options({
      auth: authClient,
    });

    google.discoverAPI(discoveryUrl).then((client, err) => {
      if (err) {
        console.log('Error during API discovery', err);
        return undefined;
      }
      client.projects.locations.registries.devices.sendCommandToDevice(
        request,
        (err, data) => {
          if (err) {
            console.log('Could not send command:', request);
            console.log('Message: ', err);
          } else {
            console.log('Success :', data.statusText);
          }
        }
      );
    });
  });
  // [END iot_send_command]
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
      description: `The Project ID to use. Defaults to the value of
        the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.`,
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
    `sendCommand <deviceId> <registryId> <command>`,
    `Sends a command to a device.`,
    {},
    opts => {
      sendCommand(
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.command
      );
    }
  )
  .example(`node $0 sendCommand my-device my-registry "test"`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;
