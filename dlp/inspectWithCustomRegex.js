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
//  title: Inspects strings
//  description: Inspects a string using custom regex pattern.
//  usage: node inspectWithCustomRegex.js my-project string customRegex

function main(projectId, string, customRegex) {
  // [START dlp_inspect_custom_regex]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Patients MRN 444-5-22222';

  // The regex pattern to match for
  // const customRegex = '[1-9]{3}-[1-9]{1}-[1-9]{5}';

  async function inspectWithCustomRegex() {
    // Construct item to inspect
    const item = {
      byteItem: {
        type: DLP.protos.google.privacy.dlp.v2.ByteContentItem.BytesType
          .TEXT_UTF8,
        data: Buffer.from(string, 'utf-8'),
      },
    };

    // Construct the custom regex detector.
    const customInfoTypes = [
      {
        infoType: {
          name: 'C_MRN',
        },
        likelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
        regex: {
          pattern: customRegex,
        },
      },
    ];

    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: {
        customInfoTypes: customInfoTypes,
        includeQuote: true,
      },
      item: item,
    };

    // Run request
    const [response] = await dlp.inspectContent(request);
    const findings = response.result.findings;
    if (findings.length > 0) {
      console.log('Findings: \n');
      findings.forEach(finding => {
        console.log(`InfoType: ${finding.infoType.name}`);
        console.log(`\tQuote: ${finding.quote}`);
        console.log(`\tLikelihood: ${finding.likelihood} \n`);
      });
    } else {
      console.log('No findings.');
    }
  }
  inspectWithCustomRegex();
  // [END dlp_inspect_custom_regex]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
