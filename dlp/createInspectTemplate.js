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

'use strict';

// sample-metadata:
//  title: Inspect Templates
//  description: Create a new DLP inspection configuration template.
//  usage: node createInspectTemplate.js my-project VERY_LIKELY PERSON_NAME 5 false my-template-id

function main(
  projectId,
  templateId,
  displayName,
  infoTypes,
  includeQuote,
  minLikelihood,
  maxFindings
) {
  infoTypes = transformCLI(infoTypes);
  // [START dlp_create_inspect_template]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // (Optional) The name of the template to be created.
  // const templateId = 'my-template';

  // (Optional) The human-readable name to give the template
  // const displayName = 'My template';

  async function createInspectTemplate() {
    // Construct the inspection configuration for the template
    const inspectConfig = {
      infoTypes: infoTypes,
      minLikelihood: minLikelihood,
      includeQuote: includeQuote,
      limits: {
        maxFindingsPerRequest: maxFindings,
      },
    };

    // Construct template-creation request
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectTemplate: {
        inspectConfig: inspectConfig,
        displayName: displayName,
      },
      templateId: templateId,
    };

    const [response] = await dlp.createInspectTemplate(request);
    const templateName = response.name;
    console.log(`Successfully created template ${templateName}.`);
  }
  createInspectTemplate();
  // [END dlp_create_inspect_template]
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
