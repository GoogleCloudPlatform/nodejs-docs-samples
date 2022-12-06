// Copyright 2022 Google LLC
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

/**
 * Creates a deny policy.
 *
 * You can add deny policies to organizations, folders, and projects.
 * Each of these resources can have up to 5 deny policies.
 * Deny policies contain deny rules, which specify the following:
 *   1. The permissions to deny and/or exempt.
 *   2. The principals that are denied, or exempted from denial.
 *   3. An optional condition on when to enforce the deny rules.
 *
 * @param {string} projectId - ID or number of the Google Cloud project you want to use.
 * @param {string} policyId - Specify the ID of the deny policy you want to create.
 */
function main(projectId, policyId) {
  // [START iam_create_deny_policy]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const policyID = 'YOUR_POLICY_ID';

  const {PoliciesClient} = require('@google-cloud/iam').v2;

  const iamClient = new PoliciesClient();

  // Each deny policy is attached to an organization, folder, or project.
  // To work with deny policies, specify the attachment point.
  //
  // Its format can be one of the following:
  // 1. cloudresourcemanager.googleapis.com/organizations/ORG_ID
  // 2. cloudresourcemanager.googleapis.com/folders/FOLDER_ID
  // 3. cloudresourcemanager.googleapis.com/projects/PROJECT_ID
  //
  // The attachment point is identified by its URL-encoded resource name. Hence, replace
  // the "/" with "%2F".
  const attachmentPoint = `cloudresourcemanager.googleapis.com%2Fprojects%2F${projectId}`;

  const denyRule = {
    // Add one or more principals who should be denied the permissions specified in this rule.
    // For more information on allowed values, see: https://cloud.google.com/iam/help/deny/principal-identifiers
    deniedPrincipals: ['principalSet://goog/public:all'],
    // Optionally, set the principals who should be exempted from the
    // list of denied principals. For example, if you want to deny certain permissions
    // to a group but exempt a few principals, then add those here.
    // exceptionPrincipals: ['principalSet://goog/group/project-admins@example.com'],
    // Set the permissions to deny.
    // The permission value is of the format: service_fqdn/resource.action
    // For the list of supported permissions, see: https://cloud.google.com/iam/help/deny/supported-permissions
    deniedPermissions: ['cloudresourcemanager.googleapis.com/projects.delete'],
    // Optionally, add the permissions to be exempted from this rule.
    // Meaning, the deny rule will not be applicable to these permissions.
    // exceptionPermissions: ['cloudresourcemanager.googleapis.com/projects.create']
    //
    // Set the condition which will enforce the deny rule.
    // If this condition is true, the deny rule will be applicable. Else, the rule will not be enforced.
    // The expression uses Common Expression Language syntax (CEL).
    // Here we block access based on tags.
    //
    // Here, we create a deny rule that denies the cloudresourcemanager.googleapis.com/projects.delete permission to everyone except project-admins@example.com for resources that are tagged test.
    // A tag is a key-value pair that can be attached to an organization, folder, or project.
    // For more info, see: https://cloud.google.com/iam/docs/deny-access#create-deny-policy
    denialCondition: {
      expression: '!resource.matchTag("12345678/env", "test")',
    },
  };

  async function createDenyPolicy() {
    const request = {
      parent: `policies/${attachmentPoint}/denypolicies`,
      policy: {
        displayName: 'Restrict project deletion access',
        rules: [
          {
            description:
              'block all principals from deleting projects, unless the principal is a member of project-admins@example.com and the project being deleted has a tag with the value test',
            denyRule,
          },
        ],
      },
      policyId,
    };

    const [operation] = await iamClient.createPolicy(request);
    const [policy] = await operation.promise();

    console.log(`Created the deny policy: ${policy.name}`);
  }

  createDenyPolicy();
  // [END iam_create_deny_policy]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
