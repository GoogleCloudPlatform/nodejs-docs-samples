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
//  title: De-identify with Exception List
//  description: De-identify sensitive data in a string with exceptions
//  usage: node deIdentifyWithExceptionList.js my-project string words infotypes

function main(projectId, textToInspect, words, infoTypes) {
  words = words.split(',');
  infoTypes = transformCLI(infoTypes);
  // [START dlp_deidentify_exception_list]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Initialize client that will be used to send requests. This client only needs to be created
  // once, and can be reused for multiple requests. After completing all of your requests, call
  // the "close" method on the client to safely clean up any remaining background resources.
  const dlp = new DLP.DlpServiceClient();

  // TODO(developer): Replace these variables before running the sample.
  // const projectId = "your-project-id";

  // The string to deidentify
  // const textToInspect = 'jack@example.org accessed customer record of user5@example.com';

  // Words to exclude for during inspection
  // const words = ['jack@example.org', 'jill@example.org'];

  // The infoTypes of information to match
  // See https://cloud.google.com/dlp/docs/concepts-infotypes for more information
  // about supported infoTypes.
  // const infoTypes = [{ name: 'EMAIL_ADDRESS' }];

  async function deIdentifyWithExceptionList() {
    // Construct item to inspect
    const item = {value: textToInspect};

    // Construct the custom dictionary detector associated with the word list.
    const wordListDict = {
      wordList: {
        words: words,
      },
    };

    // Construct a rule set that will only match if the match text does not
    // contains tokens from the exclusion list.
    const ruleSet = [
      {
        infoTypes: infoTypes,
        rules: [
          {
            exclusionRule: {
              matchingType:
                DLP.protos.google.privacy.dlp.v2.MatchingType
                  .MATCHING_TYPE_FULL_MATCH,
              dictionary: wordListDict,
            },
          },
        ],
      },
    ];

    // Combine configurations to construct inspect config.
    const inspectConfig = {
      infoTypes: infoTypes,
      ruleSet: ruleSet,
    };

    // Define type of de-identification as replacement & associate de-identification type with info type.
    const transformation = {
      infoTypes: [],
      primitiveTransformation: {
        replaceWithInfoTypeConfig: {},
      },
    };

    // Construct the configuration for the de-identification request and list all desired transformations.
    const deidentifyConfig = {
      infoTypeTransformations: {
        transformations: [transformation],
      },
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: item,
      inspectConfig: inspectConfig,
      deidentifyConfig: deidentifyConfig,
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);

    // Print the results
    console.log(
      `Text after replace with infotype config: ${response.item.value}`
    );
  }

  deIdentifyWithExceptionList();
  // [END dlp_deidentify_exception_list]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(infoTypes) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;
  return infoTypes;
}
