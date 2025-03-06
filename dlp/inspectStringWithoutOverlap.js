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
//  title: Inspects strings without overlapping.
//  description: Inspect a string for sensitive data, omitting overlapping matches on domain and email
//  usage: node inspectStringWithoutOverlap.js my-project string

function main(projectId, string) {
  // [START dlp_inspect_string_without_overlap]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'example.com is a domain, james@example.org is an email.';

  async function inspectStringWithoutOverlap() {
    // Construct item to inspect
    const item = {value: string};

    // The infoTypes of information to match
    const infoTypes = [{name: 'DOMAIN_NAME'}, {name: 'EMAIL_ADDRESS'}];

    // Define a custom info type to exclude email addresses
    const customInfoTypes = [
      {
        infoType: {name: 'EMAIL_ADDRESS'},
        exclusionType:
          DLP.protos.google.privacy.dlp.v2.CustomInfoType.ExclusionType
            .EXCLUSION_TYPE_EXCLUDE,
      },
    ];

    // Construct a exclusion rule
    const exclusionRule = {
      excludeInfoTypes: {
        infoTypes: [{name: 'EMAIL_ADDRESS'}],
      },
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    // Construct a rule set with exclusions
    const ruleSet = [
      {
        infoTypes: [{name: 'DOMAIN_NAME'}],
        rules: [
          {
            exclusionRule: exclusionRule,
          },
        ],
      },
    ];

    // Construct the inspect configuration
    const inspectConfig = {
      infoTypes: infoTypes,
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
  inspectStringWithoutOverlap();
  // [END dlp_inspect_string_without_overlap]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
