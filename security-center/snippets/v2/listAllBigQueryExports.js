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
  const parent = client.organizationLocationPath(organizationId, location);

  /**
   *  The maximum number of configs to return. The service may return fewer than
   *  this value.
   *  If unspecified, at most 10 configs will be returned.
   *  The maximum value is 1000; values above 1000 will be coerced to 1000.
   */
  // const pageSize = 1234
  /**
   *  A page token, received from a previous `ListBigQueryExports` call.
   *  Provide this to retrieve the subsequent page.
   *  When paginating, all other parameters provided to `ListBigQueryExports`
   *  must match the call that provided the page token.
   */
  // const pageToken = 'abc123'

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
