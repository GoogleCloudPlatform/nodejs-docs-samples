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
//  title: De-identify with Dictionary Replacement
//  description: De-identify sensitive data in a string by replacing it with a random list of replacement string.
//  usage: node deidentifyWithDictionaryReplacement.js my-project string infoTypes words
function main(projectId, string, infoTypes, words) {
  [infoTypes, words] = transformCLI(infoTypes, words);
  // [START dlp_deidentify_dictionary_replacement]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to de-identify
  // const string = 'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'EMAIL_ADDRESS' }];

  // The words to replace sensitive information with
  // const words = ['izumi@example.com', 'alex@example.com', 'tal@example.com'];

  async function deidentifyWithDictionaryReplacement() {
    // Construct word list to be used for replacement
    const wordList = {
      words: words,
    };
    // Construct item to de-identify
    const item = {value: string};

    // Specify replacement dictionary config using word list.
    const replaceDictionaryConfig = {
      wordList: wordList,
    };

    // Associate replacement dictionary config with infotype transformation.
    const infoTypeTransformations = {
      transformations: [
        {
          infoTypes: infoTypes,
          primitiveTransformation: {
            replaceDictionaryConfig: replaceDictionaryConfig,
          },
        },
      ],
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      deidentifyConfig: {
        infoTypeTransformations: infoTypeTransformations,
      },
      item: item,
    };

    // Run de-identification request.
    const [response] = await dlp.deidentifyContent(request);
    const deidentifiedItem = response.item;

    // Print results.
    console.log(deidentifiedItem.value);
  }

  deidentifyWithDictionaryReplacement();
  // [END dlp_deidentify_dictionary_replacement]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(infoTypes, excludedWords) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;

  excludedWords = excludedWords ? excludedWords.split(',') : [];

  return [infoTypes, excludedWords];
}
