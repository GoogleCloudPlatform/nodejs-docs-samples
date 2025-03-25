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
 *  Retrieve an existing BigQuery export.
 */
function main(organizationId, exportId, location = 'global') {
  // [START securitycenter_get_bigquery_export_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();

  // Build the full resource path for the BigQuery export to retrieve.
  /*
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const exportId = 'EXPORT_ID';
  // const location = 'LOCATION_ID';
  const name = `organizations/${organizationId}/locations/${location}/bigQueryExports/${exportId}`;

  // Build the request.
  const getBigQueryExportRequest = {
    name,
  };

  async function getBigQueryExport() {
    // Call the API.
    const [response] = await client.getBigQueryExport(getBigQueryExportRequest);
    console.log('Retrieved the BigQuery export: %j', response);
  }

  getBigQueryExport();
  // [END securitycenter_get_bigquery_export_v2]
}

main(...process.argv.slice(2));
