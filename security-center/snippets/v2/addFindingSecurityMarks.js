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
 * Demostrates adding security marks to a finding.
 */
function main(findingName = 'full finding path to add marks to') {
  // [START securitycenter_add_finding_security_marks_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  // findingName is the full resource path for the finding to update.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const findingName = `organizations/${organizationNumber}/sources/${sourceId}/locations/${location}/findings/${findingId}`
  const updateSecurityMarksRequest = {
    securityMarks: {
      name: `${findingName}/securityMarks`,
      marks: {key_a: 'value_a', key_b: 'value_b'},
    },
    // Only update the marks with these keys.
    updateMask: {paths: ['marks.key_a', 'marks.key_b']},
  };

  async function addFindingSecurityMarks() {
    const [newMarks] = await client.updateSecurityMarks(
      updateSecurityMarksRequest
    );

    console.log('New marks: %j', newMarks);
  }
  addFindingSecurityMarks();
  // [END securitycenter_add_finding_security_marks_v2]
}

main(...process.argv.slice(2));
