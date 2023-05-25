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
//  title: Inspects strings omit overlapping.
//  description: Inspect a string for sensitive data excluding a list of words.
//  usage: node inspectStringWithExclusionDict.js my-project string infoTypes excludedWords

function main(projectId, string, infoTypes, excludedWords) {
  [infoTypes, excludedWords] = transformCLI(infoTypes, excludedWords);
  // [START dlp_inspect_string_with_exclusion_dict]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Some email addresses: gary@example.com, example@example.com';

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'EMAIL_ADDRESS' }];

  // Words to exclude
  // const excludedWords = ['gary@example.com'];

  async function inspectStringWithExclusionDict() {
    // Specify the type and content to be inspected.
    const item = {
      byteItem: {
        type: DLP.protos.google.privacy.dlp.v2.ByteContentItem.BytesType
          .TEXT_UTF8,
        data: Buffer.from(string, 'utf-8'),
      },
    };

    // Exclude matches from the specified excludedWords.
    const exclusionRule = {
      dictionary: {
        wordList: {
          words: excludedWords,
        },
      },
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType.MATCHING_TYPE_FULL_MATCH,
    };

    // Construct a ruleset that applies the exclusion rule to the specified infotype.
    const ruleSet = [
      {
        infoTypes: infoTypes,
        rules: [
          {
            exclusionRule: exclusionRule,
          },
        ],
      },
    ];

    // Construct the configuration for the Inspect request, including the ruleset.
    const inspectConfig = {
      infoTypes: infoTypes,
      ruleSet: ruleSet,
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
  inspectStringWithExclusionDict();
  // [END dlp_inspect_string_with_exclusion_dict]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

function transformCLI(infoTypes, excludedWords) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;

  excludedWords = excludedWords ? excludedWords.split(',') : [];

  return [infoTypes, excludedWords];
}
