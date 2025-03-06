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
//  title: Inspects strings by using Custom exclusion list
//  description: Inspect a string for sensitive data using custom info type excluding list of words.
//  usage: node inspectStringCustomExcludingSubstring.js my-project string excludedWords
function main(projectId, string, excludedWords) {
  excludedWords = excludedWords ? excludedWords.split(',') : [];
  // [START dlp_inspect_string_custom_excluding_substring]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Name: Doe, John. Name: Example, Jimmy';

  // Words to exclude
  // const excludedWords = ['Jimmy'];

  async function inspectStringCustomExclusionDict() {
    // Specify the content to be inspected.
    const item = {value: string};

    // Specify the type of info the inspection will look for.
    const customInfoTypes = [
      {
        infoType: {name: 'CUSTOM_NAME_DETECTOR'},
        regex: {pattern: '[A-Z][a-z]{1,15}, [A-Z][a-z]{1,15}'},
      },
    ];

    // Exclude partial matches from the specified excludedSubstringList.
    const exclusionRUle = {
      dictionary: {wordList: {words: excludedWords}},
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    // Construct a rule set that will only match if the match text does not
    // contains tokens from the exclusion list.
    const ruleSet = [
      {
        infoTypes: [{name: 'CUSTOM_NAME_DETECTOR'}],
        rules: [
          {
            exclusionRule: exclusionRUle,
          },
        ],
      },
    ];

    // Construct the configuration for the Inspect request, including the ruleset.
    const inspectConfig = {
      customInfoTypes: customInfoTypes,
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
  inspectStringCustomExclusionDict();
  // [END dlp_inspect_string_custom_excluding_substring]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
