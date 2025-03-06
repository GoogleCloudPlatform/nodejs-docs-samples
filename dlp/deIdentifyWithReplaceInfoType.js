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
//  title: De-identify data: Replacing matched input values with Info Types
//  description: Uses the Data Loss Prevention API to deidentify sensitive data in a
//    string by replacing it with the info type.
//  usage: node deIdentifyWithReplaceInfoType.js my-project string infoTypes

function main(projectId, string, infoTypes) {
  infoTypes = parseInfotypes(infoTypes);
  // [START dlp_deidentify_replace_infotype]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The string to deidentify
  // const string = 'My email is test@example.com';

  // The string to replace sensitive information with
  // const infoTypes = [{name: 'EMAIL_ADDRESS'}];

  async function deIdentifyWithInfoTypeReplace() {
    // Define type of deidentification as replacement with info type.
    const primitiveTransformation = {
      replaceWithInfoTypeConfig: {},
    };

    // Associate deidentification type with info type.
    const deidentifyConfig = {
      infoTypeTransformations: {
        transformations: [
          {
            primitiveTransformation: primitiveTransformation,
          },
        ],
      },
    };

    // Specify inspect confiugration using infotypes.
    const inspectConfig = {
      infoTypes: infoTypes,
    };

    // Specify the content to be inspected.
    const item = {
      value: string,
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item,
      deidentifyConfig,
      inspectConfig,
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.deidentifyContent(request);
    // Print the results
    console.log(`Text after replacement: ${response.item.value}`);
  }

  deIdentifyWithInfoTypeReplace();
  // [END dlp_deidentify_replace_infotype]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));

function parseInfotypes(infoTypes) {
  return infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;
}
