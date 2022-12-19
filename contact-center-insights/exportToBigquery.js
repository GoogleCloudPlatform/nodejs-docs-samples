// Copyright 2021 Google LLC
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
//

'use strict';

function main(projectId, bigqueryProjectId, bigqueryDataset, bigqueryTable) {
  // [START contactcenterinsights_export_to_bigquery]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my_project_id';
  // const bigqueryProjectId = 'my_bigquery_project_id';
  // const bigqueryDataset = 'my_bigquery_dataset';
  // const bigqueryTable = 'my_bigquery_table';

  // Imports the Contact Center Insights client.
  const {
    ContactCenterInsightsClient,
  } = require('@google-cloud/contact-center-insights');

  // Instantiates a client.
  const client = new ContactCenterInsightsClient();

  async function exportToBigquery() {
    const [operation] = await client.exportInsightsData({
      parent: client.locationPath(projectId, 'us-central1'),
      bigQueryDestination: {
        projectId: bigqueryProjectId,
        dataset: bigqueryDataset,
        table: bigqueryTable,
      },
      filter: 'agent_id="007"',
    });

    // Wait for the operation to complete.
    await operation.promise();
    console.info('Exported data to BigQuery');
  }
  exportToBigquery();
  // [END contactcenterinsights_export_to_bigquery]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
