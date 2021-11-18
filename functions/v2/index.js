// Copyright 2021 Google LLC
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

'use strict';

// [START functions_cloudevent_pubsub]
/**
 * CloudEvent function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} cloudevent A CloudEvent containing the Pub/Sub message.
 * @param {object} cloudevent.data.message The Pub/Sub message itself.
 */
exports.helloPubSub = cloudevent => {
  const base64name = cloudevent.data.message.data;

  const name = base64name
    ? Buffer.from(base64name, 'base64').toString()
    : 'World';

  console.log(`Hello, ${name}!`);
};
// [END functions_cloudevent_pubsub]

// [START functions_cloudevent_storage]
/**
 * CloudEvent function to be triggered by Cloud Storage.
 *
 * @param {object} cloudevent A CloudEvent containing the Cloud Storage event.
 * @param {object} cloudevent.data The Cloud Storage event itself.
 */
exports.helloGCS = cloudevent => {
  console.log(`Event ID: ${cloudevent.id}`);
  console.log(`Event Type: ${cloudevent.type}`);

  const file = cloudevent.data;
  console.log(`Bucket: ${file.bucket}`);
  console.log(`File: ${file.name}`);
  console.log(`Metageneration: ${file.metageneration}`);
  console.log(`Created: ${file.timeCreated}`);
  console.log(`Updated: ${file.updated}`);
};
// [END functions_cloudevent_storage]

// [START functions_log_cloudevent]
/**
 * CloudEvent function to be triggered by an Eventarc Cloud Audit Logging trigger
 * Note: this is NOT designed for second-party (Cloud Audit Logs -> Pub/Sub) triggers!
 *
 * @param {object} cloudevent A CloudEvent containing the Cloud Audit Log entry.
 * @param {object} cloudevent.data.protoPayload The Cloud Audit Log entry itself.
 */
exports.helloAuditLog = cloudevent => {
  // Print out details from the CloudEvent itself
  console.log('API method:', cloudevent.methodname);
  console.log('Event type:', cloudevent.type);
  console.log('Subject:', cloudevent.subject);

  // Print out details from the Cloud Audit Logging entry
  const payload = cloudevent.data && cloudevent.data.protoPayload;
  if (payload) {
    console.log('Resource name:', payload.resourceName);
  }

  const request = payload.request;
  if (request) {
    console.log('Request type:', request['@type']);
  }

  const metadata = payload && payload.requestMetadata;
  if (metadata) {
    console.log('Caller IP:', metadata.callerIp);
    console.log('User agent:', metadata.callerSuppliedUserAgent);
  }
};
// [END functions_log_cloudevent]

// [START functions_label_gce_instance]
const compute = require('@google-cloud/compute');
const instancesClient = new compute.InstancesClient();

/**
 * CloudEvent function that labels newly-created GCE instances with the entity
 * (person or service account) that created them.
 *
 * @param {object} cloudevent A CloudEvent containing the Cloud Audit Log entry.
 * @param {object} cloudevent.data.protoPayload The Cloud Audit Log entry itself.
 */
exports.autoLabelInstance = async cloudevent => {
  // Extract parameters from the CloudEvent + Cloud Audit Log data
  const payload = cloudevent.data && cloudevent.data.protoPayload;
  const authInfo = payload && payload.authenticationInfo;
  let creator = authInfo && authInfo.principalEmail;

  // Get relevant VM instance details from the cloudevent's `subject` property
  // Example value:
  //   compute.googleapis.com/projects/<PROJECT>/zones/<ZONE>/instances/<INSTANCE>
  const params = cloudevent.subject && cloudevent.subject.split('/');

  // Validate data
  if (!creator || !params || params.length !== 7) {
    throw new Error('Invalid event structure');
  }

  // Format the 'creator' parameter to match GCE label validation requirements
  creator = creator.toLowerCase().replace(/\W/g, '_');

  // Get the newly-created VM instance's label fingerprint
  // This is required by the Compute Engine API to prevent duplicate labels
  const getInstanceRequest = {
    project: params[2],
    zone: params[4],
    instance: params[6],
  };
  const [instance] = await instancesClient.get(getInstanceRequest);

  // Label the instance with its creator
  const setLabelsRequest = Object.assign(
    {
      instancesSetLabelsRequestResource: {
        labels: {creator},
        labelFingerprint: instance.labelFingerprint,
      },
    },
    getInstanceRequest
  );

  return instancesClient.setLabels(setLabelsRequest);
};
// [END functions_label_gce_instance]
