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
//  title: Inspects strings by using multiple rules
//  description: Inspect a string for sensitive data by using multiple rules.
//  usage: node inspectStringMultipleRules.js my-project string
function main(projectId, string) {
  // [START dlp_inspect_string_multiple_rules]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'patient: Jane Doe';

  async function inspectStringMultipleRules() {
    // Construct item to inspect
    const item = {value: string};

    // Construct hotword rules
    const patientRule = {
      hotwordRegex: {pattern: 'patient'},
      proximity: {windowBefore: 10},
      likelihoodAdjustment: {
        fixedLikelihood:
          DLP.protos.google.privacy.dlp.v2.Likelihood.VERY_LIKELY,
      },
    };

    const doctorRule = {
      hotwordRegex: {pattern: 'doctor'},
      proximity: {windowBefore: 10},
      likelihoodAdjustment: {
        fixedLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.UNLIKELY,
      },
    };

    // Construct exclusion rules
    const quasimodoRule = {
      dictionary: {wordList: {words: ['quasimodo']}},
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    const redactedRule = {
      regex: {pattern: 'REDACTED'},
      matchingType:
        DLP.protos.google.privacy.dlp.v2.MatchingType
          .MATCHING_TYPE_PARTIAL_MATCH,
    };

    // The infoTypes of information to match
    const infoTypes = [{name: 'PERSON_NAME'}];

    // Construct a ruleset that applies the rules to the PERSON_NAME infotype.
    const ruleSet = [
      {
        infoTypes: infoTypes,
        rules: [
          {hotwordRule: patientRule},
          {hotwordRule: doctorRule},
          {exclusionRule: quasimodoRule},
          {exclusionRule: redactedRule},
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
  inspectStringMultipleRules();
  // [END dlp_inspect_string_multiple_rules]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
