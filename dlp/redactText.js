// Copyright 2020 Google LLC
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

// sample-metadata:
//  title: Redact Text
//  description: Redact sensitive data from text using the Data Loss Prevention API.
//  usage: node redactText.js my-project string minLikelihood infoTypes

function main(projectId, string, minLikelihood, infoTypes) {
  infoTypes = transformCLI(infoTypes);
  // [START dlp_redact_text]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Construct transformation config which replaces sensitive info with its info type.
  // E.g., "Her email is xxx@example.com" => "Her email is [EMAIL_ADDRESS]"
  const replaceWithInfoTypeTransformation = {
    primitiveTransformation: {
      replaceWithInfoTypeConfig: {},
    },
  };

  async function redactText() {
    // Construct redaction request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: {
        value: string,
      },
      deidentifyConfig: {
        infoTypeTransformations: {
          transformations: [replaceWithInfoTypeTransformation],
        },
      },
      inspectConfig: {
        minLikelihood: minLikelihood,
        infoTypes: infoTypes,
      },
    };

    // Run string redaction
    const [response] = await dlp.deidentifyContent(request);
    const resultString = response.item.value;
    console.log(`Redacted text: ${resultString}`);
  }
  redactText();
  // [END dlp_redact_text]
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
