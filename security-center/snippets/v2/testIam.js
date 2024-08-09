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
function main(organizationId, sourceId, permissions) {
  // [START securitycenter_test_iam_permissions_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();
  /**
   *  REQUIRED: The resource for which the policy detail is being requested.
   *  See the operation documentation for the appropriate value for this field.
   */
  const sourceName = client.organizationSourcePath(organizationId, sourceId);
  /**
   *  The set of permissions to check for the `resource`. Permissions with
   *  wildcards (such as '*' or 'storage.*') are not allowed. For more
   *  information see
   *  IAM Overview (https://cloud.google.com/iam/docs/overview#permissions).
   */
  // const permissions = ['abc','def']

  // Build the request.
  const testIamPermissionsRequest = {
    resource: sourceName,
    permissions: [permissions],
  };

  async function testIamPermissions() {
    const [response] = await client.testIamPermissions(
      testIamPermissionsRequest
    );
    console.log('IAM permission to test: %j', response);
  }

  testIamPermissions();
  // [END securitycenter_test_iam_permissions_v2]
}

main(...process.argv.slice(2));
