// Copyright 2020 Google LLC
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

async function main(projectId, templateId, memberId) {
  // [START data_catalog_grant_tag_template_user_role]
  // Import the Google Cloud client library.
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  async function grantTagTemplateUserRole() {
    // Grant the tagTemplateUser role to a member of the project.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project'; // Google Cloud Platform project
    // const templateId = 'my_existing_template';
    // const memberId = 'my_member_id'

    const location = 'us-central1';

    // Format the Template name.
    const templateName = datacatalog.tagTemplatePath(
      projectId,
      location,
      templateId
    );

    // Retrieve Template's current IAM Policy.
    const [getPolicyResponse] = await datacatalog.getIamPolicy({
      resource: templateName,
    });
    const policy = getPolicyResponse;

    // Add Tag Template User role and member to the policy.
    policy.bindings.push({
      role: 'roles/datacatalog.tagTemplateUser',
      members: [memberId],
    });

    const request = {
      resource: templateName,
      policy: policy,
    };

    // Update Template's policy.
    const [updatePolicyResponse] = await datacatalog.setIamPolicy(request);

    updatePolicyResponse.bindings.forEach(binding => {
      console.log(`Role: ${binding.role}, Members: ${binding.members}`);
    });
  }
  grantTagTemplateUserRole();
  // [END data_catalog_grant_tag_template_user_role]
}
main(...process.argv.slice(2));
