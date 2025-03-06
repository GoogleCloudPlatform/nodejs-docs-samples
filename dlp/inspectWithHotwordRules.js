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
//  description: Inspect a string using the Data Loss Prevention API.
//  usage: node inspectWithHotwordRules.js my-project string minLikelihood maxFindings infoTypes customInfoTypes includeQuote hotwordRegexPattern

function main(
  projectId,
  string,
  minLikelihood,
  maxFindings,
  infoTypes,
  customInfoTypes,
  includeQuote,
  hotwordRegexPattern
) {
  [infoTypes, customInfoTypes] = transformCLI(infoTypes, customInfoTypes);
  // [START dlp_inspect_hotword_rule]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to inspect
  // const string = 'Patients MRN 444-5-22222';

  // The minimum likelihood required before returning a match
  // const minLikelihood = DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE;

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // See https://cloud.google.com/dlp/docs/concepts-infotypes for more information
  // about supported infoTypes.
  // const infoTypes = [{ name: 'EMAIL_ADDRESS' }];

  // The customInfoTypes of information to match
  // const customInfoTypes = [{ infoType: { name: 'DICT_TYPE' }, dictionary: { wordList: { words: ['foo', 'bar', 'baz']}}},
  //   { infoType: { name: 'REGEX_TYPE' }, regex: {pattern: '\\(\\d{3}\\) \\d{3}-\\d{4}'}}];

  // Whether to include the matching string
  // const includeQuote = true;

  // Custom hotword regex patten
  // const hotwordRegexPattern = '(?i)(mrn|medical)(?-i)';

  async function inspectWithHotwordRule() {
    // Construct item to inspect
    const item = {
      byteItem: {
        type: DLP.protos.google.privacy.dlp.v2.ByteContentItem.BytesType
          .TEXT_UTF8,
        data: Buffer.from(string, 'utf-8'),
      },
    };

    // Construct a hot word rule
    const hotwordRule = {
      hotwordRegex: {
        pattern: hotwordRegexPattern,
      },
      proximity: {
        windowBefore: 10,
      },
      likelihoodAdjustment: {
        fixedLikelihood:
          DLP.protos.google.privacy.dlp.v2.Likelihood.VERY_LIKELY,
      },
    };

    // Construct a hotword inspection rule
    const inpectionRuleSet = [
      {
        infoTypes: customInfoTypes.map(
          customInfoType => customInfoType.infoType
        ),
        rules: [{hotwordRule: hotwordRule}],
      },
    ];

    // Assigns likelihood to each match
    customInfoTypes = customInfoTypes.map(customInfoType => {
      customInfoType.likelihood =
        DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE;
      return customInfoType;
    });

    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: {
        infoTypes: infoTypes,
        customInfoTypes: customInfoTypes,
        minLikelihood: minLikelihood,
        includeQuote: includeQuote,
        limits: {
          maxFindingsPerRequest: maxFindings,
        },
        ruleSet: inpectionRuleSet,
      },
      item: item,
    };

    // Run request
    const [response] = await dlp.inspectContent(request);
    const findings = response.result.findings;
    if (findings.length > 0) {
      console.log('Findings:');
      findings.forEach(finding => {
        if (includeQuote) {
          console.log(`\tQuote: ${finding.quote}`);
        }
        console.log(`\tInfo type: ${finding.infoType.name}`);
        console.log(`\tLikelihood: ${finding.likelihood}`);
      });
    } else {
      console.log('No findings.');
    }
  }
  inspectWithHotwordRule();
  // [END dlp_inspect_hotword_rule]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(infoTypes, customInfoTypes) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;

  if (customInfoTypes) {
    customInfoTypes = customInfoTypes.includes(',')
      ? customInfoTypes.split(',').map((dict, idx) => {
          return {
            infoType: {name: 'CUSTOM_DICT_'.concat(idx.toString())},
            dictionary: {wordList: {words: dict.split(',')}},
          };
        })
      : customInfoTypes.split(',').map((rgx, idx) => {
          return {
            infoType: {name: 'CUSTOM_REGEX_'.concat(idx.toString())},
            regex: {pattern: rgx},
          };
        });
  }

  return [infoTypes, customInfoTypes];
}
