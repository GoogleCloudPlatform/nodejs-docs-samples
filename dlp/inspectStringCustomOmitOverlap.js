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
//  title: Inspect a string for sensitive data, omitting custom matches.
//  usage: node inspectStringCustomOmitOverlap.js my-project string
function main(projectId, string) {
  // [START dlp_inspect_string_custom_omit_overlap]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Name: Jane Doe. Name: Larry Page.';

  async function inspectStringCustomOmitOverlap() {
    // Construct item to inspect
    const item = {value: string};

    // Construct a custom regex detector for names
    const customInfoTypes = [
      {
        infoType: {name: 'VIP_DETECTOR'},
        regex: {pattern: 'Larry Page|Sergey Brin'},
        exclusionType:
          DLP.protos.google.privacy.dlp.v2.CustomInfoType.ExclusionType
            .EXCLUSION_TYPE_EXCLUDE,
      },
    ];

    // Construct a exclusion rule
    const exclusionRule = {
      excludeInfoTypes: {
        infoTypes: [{name: 'VIP_DETECTOR'}],
      },
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType.MATCHING_TYPE_FULL_MATCH,
    };

    // Construct a rule set that will only match if the match text does not
    // contains Info type matches.
    const ruleSet = [
      {
        infoTypes: [{name: 'PERSON_NAME'}],
        rules: [
          {
            exclusionRule: exclusionRule,
          },
        ],
      },
    ];

    // Construct the inspect configuration
    const inspectConfig = {
      infoTypes: [{name: 'PERSON_NAME'}],
      customInfoTypes: customInfoTypes,
      ruleSet: ruleSet,
      includeQuote: true,
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: inspectConfig,
      item: item,
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
  inspectStringCustomOmitOverlap();
  // [END dlp_inspect_string_custom_omit_overlap]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
