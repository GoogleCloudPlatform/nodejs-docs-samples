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
// [START functions_cloudevent_storage]
// [START functions_log_cloudevent]
// [START functions_label_gce_instance]
const functions = require('@google-cloud/functions-framework');

// [END functions_cloudevent_pubsub]
// [END functions_cloudevent_storage]
// [END functions_log_cloudevent]
// [END functions_label_gce_instance]

// [START functions_cloudevent_pubsub]
// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub', cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64name = cloudEvent.data.message.data;

  const name = base64name
    ? Buffer.from(base64name, 'base64').toString()
    : 'World';

  console.log(`Hello, ${name}!`);
});
// [END functions_cloudevent_pubsub]

// [START functions_cloudevent_storage]
// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent('helloGCS', cloudEvent => {
  console.log(`Event ID: ${cloudEvent.id}`);
  console.log(`Event Type: ${cloudEvent.type}`);

  const file = cloudEvent.data;
  console.log(`Bucket: ${file.bucket}`);
  console.log(`File: ${file.name}`);
  console.log(`Metageneration: ${file.metageneration}`);
  console.log(`Created: ${file.timeCreated}`);
  console.log(`Updated: ${file.updated}`);
});
// [END functions_cloudevent_storage]

// [START functions_log_cloudevent]
// Register a CloudEvent callback with the Functions Framework that will
// be triggered by an Eventarc Cloud Audit Logging trigger.
//
// Note: this is NOT designed for second-party (Cloud Audit Logs -> Pub/Sub) triggers!
functions.cloudEvent('helloAuditLog', cloudEvent => {
  // Print out details from the CloudEvent itself
  console.log('Event type:', cloudEvent.type);

  // Print out the CloudEvent's `subject` property
  // See https://github.com/cloudevents/spec/blob/v1.0.1/spec.md#subject
  console.log('Subject:', cloudEvent.subject);

  // Print out details from the `protoPayload`
  // This field encapsulates a Cloud Audit Logging entry
  // See https://cloud.google.com/logging/docs/audit#audit_log_entry_structure
  const payload = cloudEvent.data && cloudEvent.data.protoPayload;
  if (payload) {
    console.log('API method:', payload.methodName);
    console.log('Resource name:', payload.resourceName);
    console.log('Principal:', payload.authenticationInfo.principalEmail);
  }
});
// [END functions_log_cloudevent]

// [START functions_label_gce_instance]
const compute = require('@google-cloud/compute');
const instancesClient = new compute.InstancesClient();

// Register a CloudEvent callback with the Functions Framework that labels
// newly-created GCE instances with the entity (person or service account)
// that created them.
functions.cloudEvent('autoLabelInstance', async cloudEvent => {
  // Extract parameters from the CloudEvent + Cloud Audit Log data
  const payload = cloudEvent.data && cloudEvent.data.protoPayload;
  const authInfo = payload && payload.authenticationInfo;
  let creator = authInfo && authInfo.principalEmail;

  // Get relevant VM instance details from the CloudEvent's `subject` property
  // Example value:
  //   compute.googleapis.com/projects/<PROJECT>/zones/<ZONE>/instances/<INSTANCE>
  const params = cloudEvent.subject && cloudEvent.subject.split('/');

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
});
// [END functions_label_gce_instance]
