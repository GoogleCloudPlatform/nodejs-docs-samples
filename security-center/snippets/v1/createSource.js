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
 * createSource demonstrates how to create a new security finding source.
 */
function main(organizationId = 'YOUR_NUMERIC_ORG_ID') {
  // [START securitycenter_create_source]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center');

  // Creates a new client.
  const client = new SecurityCenterClient();
  // organizationId is numeric organization identifier.
  /*
   * TODO(developer): Uncomment the following lines
   */
  // const organizationId = "1234567777";
  async function createSource() {
    const [source] = await client.createSource({
      source: {
        displayName: 'Customized Display Name',
        description: 'A new custom source that does X',
      },
      parent: client.organizationPath(organizationId),
    });
    console.log('New Source: %j', source);
  }
  createSource();
  // [END securitycenter_create_source]
}

main(...process.argv.slice(2));
