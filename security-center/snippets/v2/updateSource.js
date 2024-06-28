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

//Demonstrates how to update a source.
function main(organizationId, sourceId) {
  // [START securitycenter_update_source_v2]
  // npm install '@google-cloud/security-center'
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  const client = new SecurityCenterClient();
  /**
   *  Required. The source resource to update.
   */
  const sourceName = client.organizationSourcePath(organizationId, sourceId);

  // Set the update mask to specify which properties should be updated.
  // If empty, all mutable fields will be updated.
  // For more info on constructing field mask path, see the proto or:
  // https://cloud.google.com/java/docs/reference/protobuf/latest/com.google.protobuf.FieldMask
  const updateMask = {
    paths: ['display_name'],
  };

  // Build the request.

  const source = {
    name: sourceName,
    displayName: 'New Display Name',
  };

  async function updateSource() {
    const [response] = await client.updateSource({updateMask, source});
    console.log('Updated Source: %j', response);
  }

  updateSource();
  // [END securitycenter_update_source_v2]
}

main(...process.argv.slice(2));
