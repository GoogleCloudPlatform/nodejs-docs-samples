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
//  title: Inspects a string with omitting overlapping.
//  description: Inspects a string for sensitive data, omitting overlapping matches on person name and email address.
//  usage: node inspectStringOmitOverlap.js my-project string

function main(projectId, string) {
  // [START dlp_inspect_string_omit_overlap]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'james@example.com';

  async function inspectStringWithoutOverlapPersonEmail() {
    // Construct item to inspect
    const item = {
      byteItem: {
        type: DLP.protos.google.privacy.dlp.v2.ByteContentItem.BytesType
          .TEXT_UTF8,
        data: Buffer.from(string, 'utf-8'),
      },
    };

    // Specify the type of info the inspection will look for.
    const infoTypes = [{name: 'PERSON_NAME'}, {name: 'EMAIL_ADDRESS'}];

    // Exclude EMAIL_ADDRESS matches
    const exclusionRule = {
      excludeInfoTypes: {
        infoTypes: [{name: 'EMAIL_ADDRESS'}],
      },
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    // Construct a ruleset that applies the exclusion rule to the PERSON_NAME infotype.
    // If a PERSON_NAME match overlaps with an EMAIL_ADDRESS match, the PERSON_NAME match will
    // be excluded.
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
  inspectStringWithoutOverlapPersonEmail();
  // [END dlp_inspect_string_omit_overlap]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
