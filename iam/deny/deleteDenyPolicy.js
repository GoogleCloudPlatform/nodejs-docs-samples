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
 * Deletes the policy if you no longer want to enforce the rules in a deny policy.
 *
 * @param {string} projectId - ID or number of the Google Cloud project you want to use.
 * @param {string} policyId - The ID of the deny policy you want to delete.
 */
function main(projectId, policyId) {
  // [START iam_delete_deny_policy]
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

  async function deleteDenyPolicy() {
    const request = {
      name: `policies/${attachmentPoint}/denypolicies/${policyId}`,
    };

    const [operation] = await iamClient.deletePolicy(request);
    const [policy] = await operation.promise();

    console.log(`Deleted the deny policy: ${policy.name}`);
  }

  deleteDenyPolicy();
  // [END iam_delete_deny_policy]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
