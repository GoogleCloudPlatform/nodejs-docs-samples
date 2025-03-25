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
 *  Updates an existing BigQuery export.
 */
function main(organizationId, exportId, dataset, location = 'global') {
  // [START securitycenter_update_bigquery_export_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Creates a new client.
  const client = new SecurityCenterClient();
  /**
   *  Required. Name of the BigQuery export to retrieve. The following list shows
   *  some examples of the format:
   *  +
   *  `organizations/{organization}/locations/{location}/bigQueryExports/{export_id}`
   *  + `folders/{folder}/locations/{location}/bigQueryExports/{export_id}`
   *  + `projects/{project}locations/{location}/bigQueryExports/{export_id}`
   */

  /**
   * TODO(developer): Update the following references for your own environment before running the sample.
   */
  // const organizationId = 'YOUR_ORGANIZATION_ID';
  // const location = 'LOCATION_ID';
  // const exportId = 'EXPORT_ID';
  const name = `organizations/${organizationId}/locations/${location}/bigQueryExports/${exportId}`;

  /**
   *  Required. The BigQuery export being updated.
   */
  const filter =
    'severity="LOW" OR severity="MEDIUM" AND category="Persistence: IAM Anomalous Grant" AND -resource.type:"compute"';

  const bigQueryExport = {
    name: name,
    description: 'updated description',
    dataset: dataset,
    filter: filter,
  };

  /**
   *  The list of fields to be updated.
   *  If empty all mutable fields will be updated.
   */
  const fieldMask = {
    paths: ['description', 'filter'],
  };

  // Build the request.
  const updateBigQueryExportRequest = {
    name,
    bigQueryExport,
  };

  async function updateBigQueryExport() {
    // Call the API.
    const [response] = await client.updateBigQueryExport(
      updateBigQueryExportRequest,
      fieldMask
    );
    console.log(
      `BigQueryExport updated successfully! Name: ${response.name}, Description: ${response.description}, Dataset: ${response.dataset}`
    );
  }

  updateBigQueryExport();
  // [END securitycenter_update_bigquery_export_v2]
}

main(...process.argv.slice(2));
