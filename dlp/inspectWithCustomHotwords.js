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
//  title: Inspect table using custom hotword rule
//  description: Uses the Data Loss Prevention API to inspect a table excluding findings from an entire column.
//  usage: node inspectWithCustomHotwords.js projectId
function main(projectId) {
  // [START dlp_inspect_column_values_w_custom_hotwords]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under.
  // const projectId = "your-project-id";

  // Table to inspect
  const tableToInspect = {
    headers: [
      {name: 'Fake Social Security Number'},
      {name: 'Real Social Security Number'},
    ],
    rows: [
      {
        values: [{stringValue: '111-11-1111'}, {stringValue: '222-22-2222'}],
      },
    ],
  };

  async function inspectWithCustomHotwords() {
    // Specify the regex pattern to be detected.
    const hotwordRegexPattern = '(Fake Social Security Number)';

    // Specify what content you want the service to de-identify.
    const contentItem = {
      table: tableToInspect,
    };

    // Specify the type of info the inspection will look for.
    const infoTypes = [{name: 'US_SOCIAL_SECURITY_NUMBER'}];

    // Construct hotword rule.
    const hotwordRule = {
      hotwordRegex: {
        pattern: hotwordRegexPattern,
      },
      likelihoodAdjustment: {
        fixedLikelihood:
          DLP.protos.google.privacy.dlp.v2.Likelihood.VERY_UNLIKELY,
      },
      proximity: {
        windowBefore: 1,
      },
    };

    // Construct rule set for the inspect configuration.
    const inspectionRuleSet = {
      infoTypes: infoTypes,
      rules: [
        {
          hotwordRule: hotwordRule,
        },
      ],
    };

    // Construct the configuration for the Inspect request.
    const config = {
      infoTypes: infoTypes,
      ruleSet: [inspectionRuleSet],
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      includeQuote: true,
    };

    // Construct the Inspect request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: contentItem,
      inspectConfig: config,
    };

    // Use the client to send the API request.
    const [response] = await dlp.inspectContent(request);

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
  inspectWithCustomHotwords();
  // [END dlp_inspect_column_values_w_custom_hotwords]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
