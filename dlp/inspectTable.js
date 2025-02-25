// Copyright 2023 Google LLC
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

// sample-metadata:
//  title: Inspect a table for sensitive content
//  description: Inspect a table for sensitive content such as Phone Number.
//  usage: node inspectTable.js my-project
function main(projectId) {
  // [START dlp_inspect_table]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The infoTypes of information to match
  const infoTypes = [{name: 'PHONE_NUMBER'}];

  // Table data
  const tableData = {
    headers: [{name: 'name'}, {name: 'phone'}],
    rows: [
      {
        values: [{stringValue: 'John Doe'}, {stringValue: '(206) 555-0123'}],
      },
    ],
  };

  async function inspectTable() {
    // Specify the table to be inspected.
    const item = {
      table: tableData,
    };

    // Construct the configuration for the Inspect request.
    const inspectConfig = {
      infoTypes: infoTypes,
      includeQuote: true,
    };

    // Construct the Inspect request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: inspectConfig,
      item: item,
    };

    // Use the client to send the API request.
    const [response] = await dlp.inspectContent(request);

    // Print findings.
    const findings = response.result.findings;
    if (findings.length > 0) {
      console.log(`Findings: ${findings.length}\n`);
      findings.forEach(finding => {
        console.log(`InfoType: ${finding.infoType.name}`);
        console.log(`\tQuote: ${finding.quote}`);
        console.log(`\tLikelihood: ${finding.likelihood} \n`);
      });
    } else {
      console.log('No findings.');
    }
  }
  inspectTable();
  // [END dlp_inspect_table]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
