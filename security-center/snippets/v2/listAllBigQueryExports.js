/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 *  List BigQuery exports in the given parent.
 */
function main(organizationId, location = 'global') {
  // [START securitycenter_list_bigquery_export_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
  /**
   *  Required. The parent, which owns the collection of BigQuery exports. Its
   *  format is "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */

  /**
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  const parent = client.organizationLocationPath(organizationId, location);

  // Build the request.
  const listBigQueryExportsRequest = {
    parent,
  };

  async function listBigQueryExports() {
    // Call the API.
    const iterable = client.listBigQueryExportsAsync(
      listBigQueryExportsRequest
    );
    let count = 0;
    console.log('Sources:');
    for await (const response of iterable) {
      console.log(`${++count} ${response.name} ${response.description}`);
    }
  }

  listBigQueryExports();
  // [END securitycenter_list_bigquery_export_v2]
}

main(...process.argv.slice(2));
