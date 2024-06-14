/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

//Demonstrates how to sets the access control policy on the specified Source.
function main(organizationId, sourceId, userEmail, roleId) {
  // [START securitycenter_set_iam_polices_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();
  /**
   *  REQUIRED: The complete policy to be applied to the `resource`. The size of
   *  the policy is limited to a few 10s of KB. An empty policy is a
   *  valid policy but certain Cloud Platform services (such as Projects)
   *  might reject them.
   */
  const sourceName = client.organizationSourcePath(organizationId, sourceId);

  /**
   *  OPTIONAL: A FieldMask specifying which fields of the policy to modify. Only
   *  the fields in the mask will be modified. If no mask is provided, the
   *  following default mask is used:
   *  `paths: "bindings, etag"`
   */

  async function setIamPolicy() {
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
            role: roleId,
            // New IAM Binding for the user.
            members: [`user:${userEmail}`],
          },
        ],
        updateMask: 'bindings',
      },
    });
    console.log('Updated policy: %j', updatedPolicy);
  }

  setIamPolicy();
  // [END securitycenter_set_iam_polices_v2]
}

main(...process.argv.slice(2));
