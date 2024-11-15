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
 * Demonstrates how to create a new security finding in CSCC.
 */
function main(organizationId, dataset, location = 'global') {
  // [START securitycenter_create_bigquery_export_v2]
  // Imports the Google Cloud client library.
  const {SecurityCenterClient} = require('@google-cloud/security-center').v2;

  // Create a Security Center client
  const client = new SecurityCenterClient();

  /**
   *  Required. The name of the parent resource of the new BigQuery export. Its
   *  format is "organizations/[organization_id]/locations/[location_id]",
   *  "folders/[folder_id]/locations/[location_id]", or
   *  "projects/[project_id]/locations/[location_id]".
   */
  const parent = client.organizationLocationPath(organizationId, location);

  /**
   *  Required. The BigQuery export being created.
   */
  // filter: Expression that defines the filter to apply across create/update events of findings.
  const filter = 'severity="LOW" OR severity="MEDIUM"';

  const bigQueryExport = {
    name: 'bigQueryExport node',
    description:
      'Export low and medium findings if the compute resource has an IAM anomalous grant',
    filter,
    dataset,
  };

  /**
   *  Required. Unique identifier provided by the client within the parent scope.
   *  It must consist of only lowercase letters, numbers, and hyphens, must start
   *  with a letter, must end with either a letter or a number, and must be 63
   *  characters or less.
   */
  const bigQueryExportId =
    'bigqueryexportid-' + Math.floor(Math.random() * 10000);

  // Build the request.
  const createBigQueryExportRequest = {
    parent,
    bigQueryExport,
    bigQueryExportId,
  };

  async function createBigQueryExport() {
    // Call the API.
    const [response] = await client.createBigQueryExport(
      createBigQueryExportRequest
    );
    console.log(
      `BigQuery export request created successfully: Name: ${response.name}, Dataset: ${response.dataset}, Description: ${response.description}`
    );
  }

  createBigQueryExport();
  // [END securitycenter_create_bigquery_export_v2]
}

main(...process.argv.slice(2));
