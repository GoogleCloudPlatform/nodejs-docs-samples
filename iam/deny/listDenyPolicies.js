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
 * Prints all the deny policies that are attached to a resource.
 * A resource can have up to 5 deny policies.
 *
 * @param {string} projectId - ID or number of the Google Cloud project you want to use.
 */
function main(projectId) {
  // [START iam_list_deny_policy]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';

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

  async function listDenyPolicies() {
    const request = {
      parent: `policies/${attachmentPoint}/denypolicies`,
    };

    const policies = await iamClient.listPoliciesAsync(request);
    for await (const policy of policies) {
      console.log(`- ${policy.name}`);
    }
  }

  listDenyPolicies();
  // [END iam_list_deny_policy]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
