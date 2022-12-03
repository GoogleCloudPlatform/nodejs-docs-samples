/*
 * Copyright 2019, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Prints project assets for the organization as of yesterday.
 */
function main(organizationId = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_list_assets_at_time]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  //  organizationId is the numeric ID of the organization.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const organizationId = "1234567777";
  const orgName = client.organizationPath(organizationId);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  // Call the API with automatic pagination.
  async function listAssetsAtTime() {
    const [response] = await client.listAssets({
      parent: orgName,
      filter:
        'security_center_properties.resource_type="google.cloud.resourcemanager.Project"',
      // readTime must be in the form of a google.protobuf.Timestamp object
      // which takes seconds and nanoseconds.
      readTime: {
        seconds: Math.floor(oneDayAgo.getTime() / 1000),
        nanos: (oneDayAgo.getTime() % 1000) * 1e6,
      },
    });
    let count = 0;
    Array.from(response).forEach(result =>
      console.log(
        `${++count} ${result.asset.name} ${
          result.asset.securityCenterProperties.resourceName
        }`
      )
    );
  }

  listAssetsAtTime();
  // [END securitycenter_list_assets_at_time]
}

main(...process.argv.slice(2));
