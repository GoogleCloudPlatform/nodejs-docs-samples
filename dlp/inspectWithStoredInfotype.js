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
//  title: Inspect the provided text using stored infoType.
//  description: Uses the Data Loss Prevention API to Inspect the provided text using stored infoType.
//  usage: node inspectWithStoredInfotype.js projectId, infoTypeId, string
async function main(projectId, infoTypeId, string) {
  // [START dlp_inspect_with_stored_infotype]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = 'your-project-id';

  // The custom info-type id created and stored in the bucket.
  // const infoTypeId = 'your-info-type-id';

  // The string to inspect.
  // const string = 'My phone number is (223) 456-7890 and my email address is gary@example.com.';

  async function inspectWithStoredInfotype() {
    // Reference to the existing StoredInfoType to inspect the data.
    const customInfoType = {
      infoType: {
        name: 'GITHUB_LOGINS',
      },
      storedType: {
        name: infoTypeId,
      },
    };

    // Construct the configuration for the Inspect request.
    const inspectConfig = {
      customInfoTypes: [customInfoType],
      includeQuote: true,
    };

    // Construct the Inspect request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: inspectConfig,
      item: {
        value: string,
      },
    };
    // Run request
    const [response] = await dlp.inspectContent(request);

    // Print Findings
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
  await inspectWithStoredInfotype();
  // [END dlp_inspect_with_stored_infotype]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

export default main;
