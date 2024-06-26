/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Creates or updates a finding.
 */
function main(organizationId, sourceId, findingId, location = 'global') {
  // [START securitycenter_update_finding_source_properties_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
  /**
   *  Required.  name is the full resource name of the finding to update.
   */
  const name = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

  /**
   *  Set the update mask to specify which properties should be updated.
   *  If empty all mutable fields will be updated.
   *  For more info on constructing field mask path, see the proto or:
   *  https://cloud.google.com/java/docs/reference/protobuf/latest/com.google.protobuf.FieldMask
   */

  // Build the request.
  const eventTime = new Date();
  const updateMask = {
    paths: ['event_time', 'source_properties.stringKey'],
  };

  const finding = {
    name,
    // The time associated with discovering the issue.
    eventTime: {
      seconds: Math.floor(eventTime.getTime() / 1000),
      nanos: (eventTime.getTime() % 1000) * 1e6,
    },
    sourceProperties: {
      stringKey: {stringValue: 'new_string_example'},
    },
  };

  async function updatedFindingSource() {
    // Call the API.
    const [response] = await client.updateFinding({updateMask, finding});
    console.log('Updated finding source: %j', response);
  }

  updatedFindingSource();
  // [END securitycenter_update_finding_source_properties_v2]
}

main(...process.argv.slice(2));
