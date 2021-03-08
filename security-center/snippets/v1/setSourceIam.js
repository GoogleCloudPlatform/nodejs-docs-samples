// Copyright 2019 Google LLC
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

/*
 * setSourceIamPolicy  grants user roles/securitycenter.findingsEditor permision
 * for a source. */
function main(
  sourceName = 'FULL_PATH_TO_SOURCE',
  user = 'someuser@domain.com'
) {
  // [START securitycenter_set_source_iam]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();

  async function setSourceIamPolicy() {
    // sourceName is the full resource name of the source to be
    // updated.
    // user is an email address that IAM can grant permissions to.
    /*
     * TODO(developer): Uncomment the following lines
     */
    // const sourceName = "organizations/111122222444/sources/1234";
    // const user = "someuser@domain.com";
    const [existingPolicy] = await client.getIamPolicy({
      resource: sourceName,
    });

    const [updatedPolicy] = await client.setIamPolicy({
      resource: sourceName,
      policy: {
        // Enables partial update of existing policy
        etag: existingPolicy.etag,
        bindings: [
          {
            role: 'roles/securitycenter.findingsEditor',
            // New IAM Binding for the user.
            members: [`user:${user}`],
          },
        ],
      },
    });
    console.log('Updated policy: %j', updatedPolicy);
  }
  setSourceIamPolicy();
  // [END securitycenter_set_source_iam]
}

main(...process.argv.slice(2));
