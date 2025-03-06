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
//  title: Inspect a string with substring exclusions.
//  description: Inspect a string with list of substrings to be used as exclusions.
//  usage: node inspectWithExclusionDictSubstring.js my-project string excludedSubstringList

function main(projectId, string, excludedSubstringList) {
  excludedSubstringList = excludedSubstringList
    ? excludedSubstringList.split(',')
    : [];
  // [START dlp_inspect_string_with_exclusion_dict_substring]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Some email addresses: gary@example.com, TEST@example.com';

  // List of substrings to be used for exclusion
  // const excludedSubstringList = ['Test'];

  async function inspectStringExclusionDictSubstr() {
    // Specify the type and content to be inspected.
    const item = {
      byteItem: {
        type: DLP.protos.google.privacy.dlp.v2.ByteContentItem.BytesType
          .TEXT_UTF8,
        data: Buffer.from(string, 'utf-8'),
      },
    };

    // Specify the type of info the inspection will look for.
    // See https://cloud.google.com/dlp/docs/infotypes-reference for complete list of info types.
    const infoTypes = [
      {name: 'EMAIL_ADDRESS'},
      {name: 'DOMAIN_NAME'},
      {name: 'PHONE_NUMBER'},
      {name: 'PERSON_NAME'},
    ];

    // Exclude partial matches from the specified excludedSubstringList.
    const exclusionRule = {
      dictionary: {wordList: {words: excludedSubstringList}},
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    // Construct a ruleset that applies the exclusion rule to the EMAIL_ADDRESSES infotype.
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
  inspectStringExclusionDictSubstr();
  // [END dlp_inspect_string_with_exclusion_dict_substring]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
