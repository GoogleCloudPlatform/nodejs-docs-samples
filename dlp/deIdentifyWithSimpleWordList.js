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
//  title: De-identify sensitive data with a simple word list
//  description: Uses the Data Loss Prevention API to de-identify sensitive data in a
//    string using a custom simple word list.
//  usage: node deIdentifyWithSimpleWordList.js my-project text-to-insect word-list custom-info-type-name

function main(projectId, textToInspect, words, customInfoTypeName) {
  words = words.split(',');
  // [START dlp_deidentify_simple_word_list]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // TODO(developer): Replace these variables before running the sample.
  // const projectId = "your-project-id";

  // The string to de-identify
  // const textToInspect = 'Patient was seen in RM-YELLOW then transferred to rm green.';

  // Words to look for during inspection
  // const words = ['RM-GREEN', 'RM-YELLOW', 'RM-ORANGE'];

  // Name of the custom info type
  // const customInfoTypeName = 'CUSTOM_ROOM_ID';

  async function deIdentifyWithSimpleWordList() {
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the "close" method on the client to safely clean up any remaining background resources.
    const dlp = new DLP.DlpServiceClient();

    // Construct the word list to be detected
    const wordList = {
      words: words,
    };

    // Specify the word list custom info type the inspection will look for.
    const infoType = {
      name: customInfoTypeName,
    };
    const customInfoType = {
      infoType,
      dictionary: {
        wordList,
      },
    };

    // Construct de-identify configuration
    const deidentifyConfig = {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: {
              replaceWithInfoTypeConfig: {},
            },
          },
        ],
      },
    };

    // Construct inspect configuration
    const inspectConfig = {
      customInfoTypes: [customInfoType],
    };

    // Construct Item
    const item = {
      value: textToInspect,
    };
    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item,
      deidentifyConfig,
      inspectConfig,
    };

    // Send the request and receive response from the service
    const [response] = await dlp.deidentifyContent(request);
    // Print the results
    console.log(
      `Text after replace with infotype config: ${response.item.value}`
    );
  }

  deIdentifyWithSimpleWordList();
  // [END dlp_deidentify_simple_word_list]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
