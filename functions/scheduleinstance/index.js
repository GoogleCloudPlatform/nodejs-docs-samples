// Copyright 2018 Google LLC
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

// [START functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]
const functions = require('@google-cloud/functions-framework');
const {SqlInstancesServiceClient} = require('@google-cloud/sql');
const sqlInstancesClient = new SqlInstancesServiceClient({fallback: true});
// [END functions_stop_instance_pubsub]

/**
 * Starts Cloud SQL instances.
 *
 * Expects a PubSub message with JSON-formatted event data containing
 * the label of instances to start.
 *
 */
functions.cloudEvent('startInstanceEvent', async cloudEvent => {
  try {
    const payload = _validatePayload(cloudEvent);
    const project = await sqlInstancesClient.getProjectId();
    const [labelKey, labelValue] = payload.label.split('=');
    const filter = `settings.userLabels.${labelKey}:${labelValue}`;

    console.log(
      `Attempting to start instances. Project ID resolved to: '${project}'. Filter applied: '${filter}'`
    );

    // Fetch the response object
    const [response] = await sqlInstancesClient.list({
      project,
      filter,
    });

    // Extract the array from the 'items' property (default to empty array if undefined)
    const instances = response.items || [];

    console.log(
      `Raw instances array retrieved. Found ${instances.length} matching instances.`
    );

    if (instances.length === 0) {
      console.log(
        `No SQL instances found in project '${project}' matching filter '${filter}'.`
      );
      return;
    }

    await Promise.all(
      instances.map(async instance => {
        console.log(`Starting Cloud SQL instance: ${instance.name}`);
        const request = {
          project,
          instance: instance.name,
          body: {
            settings: {
              activationPolicy: 'ALWAYS',
            },
          },
        };
        const [operation] = await sqlInstancesClient.patch(request);
        console.log(
          `Patch operation started for ${instance.name}: ${operation.name}`
        );
      })
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
});
// [END functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]

/**
 * Stops Cloud SQL instances.
 *
 * Expects a PubSub message with JSON-formatted event data containing
 * the label of instances to stop.
 *
 */
functions.cloudEvent('stopInstanceEvent', async cloudEvent => {
  try {
    const payload = _validatePayload(cloudEvent);
    const project = await sqlInstancesClient.getProjectId();
    const [labelKey, labelValue] = payload.label.split('=');
    const filter = `settings.userLabels.${labelKey}:${labelValue}`;

    console.log(
      `Attempting to stop instances. Project ID resolved to: '${project}'. Filter applied: '${filter}'`
    );

    // Fetch the response object
    const [response] = await sqlInstancesClient.list({
      project,
      filter,
    });

    // Extract the array from the 'items' property (default to empty array if undefined)
    const instances = response.items || [];

    console.log(
      `Raw instances array retrieved. Found ${instances.length} matching instances.`
    );

    if (instances.length === 0) {
      console.log(`
      No SQL instances found in project '${project}' matching filter '${filter}'.`);
      return;
    }

    await Promise.all(
      instances.map(async instance => {
        console.log(`Stopping Cloud SQL instance: ${instance.name}`);
        const request = {
          project,
          instance: instance.name,
          body: {
            settings: {
              activationPolicy: 'NEVER',
            },
          },
        };
        const [operation] = await sqlInstancesClient.patch(request);
        console.log(
          `Patch operation started for ${instance.name}: ${operation.name}`
        );
      })
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
});
// [START functions_start_instance_pubsub]

/**
 * Validates that a request payload contains the expected fields.
 */
const _validatePayload = cloudEvent => {
  let payload;
  try {
    const base64Data = cloudEvent.data.message.data;
    payload = JSON.parse(Buffer.from(base64Data, 'base64').toString());
  } catch (err) {
    throw new Error('Invalid CloudEvent / Pub/Sub message: ' + err);
  }
  if (!payload.label) {
    throw new Error("Attribute 'label' missing from payload");
  }
  return payload;
};
// [END functions_start_instance_pubsub]
// [END functions_stop_instance_pubsub]
