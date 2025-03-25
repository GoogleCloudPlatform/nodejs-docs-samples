// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Demonstrates how to sets the access control policy on the specified source.
async function main() {
  // [START securitycenter_set_iam_polices_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();

  // TODO(developer): Update the following for your own environment.
  const organizationId = '1081635000895';
  const location = 'global';

  async function createSampleFinding() {
    const uuid = require('uuid');

    const [source] = await client.createSource({
      source: {
        displayName: 'Customized Display Name V2',
        description: 'A new custom source that does X',
      },
      parent: client.organizationPath(organizationId),
    });

    const sourceId = source.name.split('/')[3];

    // Resource name of the new finding's parent. Examples:
    //  - `organizations/[organization_id]/sources/[source_id]`
    //  - `organizations/[organization_id]/sources/[source_id]/locations/[location_id]`
    const parent = `organizations/${organizationId}/sources/${sourceId}/locations/${location}`;

    // The resource this finding applied to. The Cloud Security Command Center UI can link the
    // findings for a resource to the corresponding asset of a resource if there are matches.
    const resourceName = `//cloudresourcemanager.googleapis.com/organizations/${organizationId}`;

    // Unique identifier provided by the client within the parent scope.
    // It must be alphanumeric and less than or equal to 32 characters and
    // greater than 0 characters in length.
    const findingId = uuid.v4().replace(/-/g, '');

    // Get the current timestamp.
    const eventDate = new Date();

    // Finding category.
    const category = 'MEDIUM_RISK_ONE';

    // Build the finding request object.
    const createFindingRequest = {
      parent: parent,
      findingId: findingId,
      finding: {
        resourceName,
        category,
        state: 'ACTIVE',
        // The time associated with discovering the issue.
        eventTime: {
          seconds: Math.floor(eventDate.getTime() / 1000),
          nanos: (eventDate.getTime() % 1000) * 1e6,
        },
      },
    };

    await client.createFinding(createFindingRequest);
    return sourceId;
  }

  const sourceId = await createSampleFinding();

  // The complete policy to be applied to the `resource`. The size of
  // the policy is limited to a kfew 10s of KB. An empty policy is a
  // valid policy but certain Cloud Platform services (such as Projects)
  const sourceName = client.organizationSourcePath(organizationId, sourceId);

  // OPTIONAL: A FieldMask specifying which fields of the policy to modify. Only
  // the fields in the mask will be modified. If no mask is provided, the
  // following default mask is used:
  // `paths: "bindings, etag"`

  const userEmail = 'csccclienttest@gmail.com';
  const role = 'roles/securitycenter.findingsEditor';

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
            role: role,
            // New IAM Binding for the user.
            members: [`user:${userEmail}`],
          },
        ],
        updateMask: 'bindings',
      },
    });
    console.log('Updated policy: %j', updatedPolicy);
  }

  await setIamPolicy();
  // [END securitycenter_set_iam_polices_v2]
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
