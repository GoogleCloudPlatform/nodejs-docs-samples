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
//  title: De-identify data: Redacting with matched input values
//  description: Uses the Data Loss Prevention API to de-identify sensitive data
//    in a string by redacting matched input values.
//  usage: node deIdentifyWithRedaction.js my-project string infoTypes

function main(projectId, string, infoTypes) {
  infoTypes = transformCLI(infoTypes);
  // [START dlp_deidentify_redact]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // TODO(developer): Replace these variables before running the sample.
  // const projectId = "your-project-id";

  // The string to deidentify
  // const string =
  //   'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';

  // The infoTypes of information to match
  // See https://cloud.google.com/dlp/docs/concepts-infotypes for more information
  // about supported infoTypes.
  // const infoTypes = [{name: 'EMAIL_ADDRESS'}];

  async function deIdentifyRedaction() {
    // Construct deidentify configuration
    const deidentifyConfig = {
      infoTypeTransformations: {
        transformations: [
          {
            infoTypes: infoTypes,
            primitiveTransformation: {
              redactConfig: {},
            },
          },
        ],
      },
    };

    // Construct inspect configuration
    const inspectConfig = {
      infoTypes: infoTypes,
    };

    // Construct Item
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

    // Send the request and receive response from the service
    const [response] = await dlp.deidentifyContent(request);

    // Print the results
    console.log(`Text after redaction: ${response.item.value}`);
  }

  deIdentifyRedaction();
  // [END dlp_deidentify_redact]
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
