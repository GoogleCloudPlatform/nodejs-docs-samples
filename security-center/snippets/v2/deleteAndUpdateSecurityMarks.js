// Copyright 2024 Google LLC
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

/**
 * Demostrates updating and deleting security marks to a finding.
 */
function main(
  organizationId,
  sourceId,
  location = 'global',
  findingId = 'somefinding'
) {
  // [START securitycenter_add_delete_security_marks_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  // Build the full resource path for the finding to update.
  /*
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const sourceId = 'SOURCE_ID';
  const findingName = `organizations/${organizationId}/sources/${sourceId}/locations/${location}/findings/${findingId}`;

  // Construct the request to be sent by the client.
  const updateSecurityMarksRequest = {
    securityMarks: {
      name: `${findingName}/securityMarks`,
      marks: {key_a: 'new_value_for_a'},
    },
    // Set the update mask to specify which properties should be updated.
    // If empty, all mutable fields will be updated.
    // For more info on constructing field mask path, see the proto or:
    // https://cloud.google.com/java/docs/reference/protobuf/latest/com.google.protobuf.FieldMask.
    // Since no marks have been added, including "marks.key_b" in the update mask
    // will cause it to be deleted.
    updateMask: {paths: ['marks.key_a', 'marks.key_b']},
  };

  async function UpdateAndDeleteSecurityMarks() {
    const [newMarks] = await client.updateSecurityMarks(
      updateSecurityMarksRequest
    );

    console.log('New marks: %j', newMarks);
  }
  UpdateAndDeleteSecurityMarks();
  // [END securitycenter_add_delete_security_marks_v2]
}

main(...process.argv.slice(2));
