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

//Demonstrates how to retrieve IAM policies for a source.
function main(organizationId, sourceId) {
  // [START securitycenter_get_iam_policies_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();
  /**
   *  REQUIRED: The resource for which the policy is being requested.
   *  See the operation documentation for the appropriate value for this field.
   */
  const sourceName = client.organizationSourcePath(organizationId, sourceId);

  // Build the request.
  const getIamPolicyRequest = {
    resource: sourceName,
  };

  async function getIamPolicy() {
    const [response] = await client.getIamPolicy(getIamPolicyRequest);
    console.log('Policy: %j', response);
  }

  getIamPolicy();
  // [END securitycenter_get_iam_policies_v2]
}

main(...process.argv.slice(2));
