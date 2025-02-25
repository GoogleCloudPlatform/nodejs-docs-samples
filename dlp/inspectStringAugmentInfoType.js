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
//  title: Inspect String using augment info type to the Inspect Request.
//  description: Uses the Data Loss Prevention API to Inspect String using augment PERSON_NAME infoType to the Inspect Request.
//  usage: node inspectStringAugmentInfoType.js my-project string words
function main(projectId, string, words) {
  words = words ? words.split(',') : [];
  // [START dlp_inspect_augment_infotypes]
  // Imports the Google Cloud client library
  import DLP from '@google-cloud/dlp';
  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = "The patient's name is quasimodo";

  // Word list
  // const words = ['quasimodo'];

  async function inspectStringAugmentInfoType() {
    // Specify the type and content to be inspected.
    const byteItem = {
      type: 'BYTES',
      data: Buffer.from(string),
    };
    const item = {byteItem: byteItem};

    // Construct the custom word list to be detected.
    const dictionary = {
      wordList: {
        words: words,
      },
    };

    // Construct a custom infotype detector by augmenting the PERSON_NAME detector with a word list.
    const customInfoType = {
      infoType: {name: 'PERSON_NAME'},
      dictionary: dictionary,
    };

    const inspectConfig = {
      customInfoTypes: [customInfoType],
      includeQuote: true,
    };

    // Construct the Inspect request to be sent by the client.
    const inspectRequest = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: inspectConfig,
      item: item,
    };

    // Use the client to send the API request.
    const [response] = await dlp.inspectContent(inspectRequest);

    // Print Findings.
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
  inspectStringAugmentInfoType();
  // [END dlp_inspect_augment_infotypes]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
