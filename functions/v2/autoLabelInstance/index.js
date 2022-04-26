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

// [START functions_label_gce_instance]
const functions = require('@google-cloud/functions-framework');

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
