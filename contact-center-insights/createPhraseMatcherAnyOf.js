// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict';

function main(projectId) {
  // [START contactcenterinsights_create_phrase_matcher_any_of]
  /**
   * TODO(developer): Uncomment this variable before running the sample.
   */
  // const projectId = 'my_project_id';

  // Imports the Contact Center Insights client.
  const {
    ContactCenterInsightsClient,
  } = require('@google-cloud/contact-center-insights');

  // Instantiates a client.
  const client = new ContactCenterInsightsClient();

  async function createPhraseMatcherAnyOf() {
    const [phraseMatcher] = await client.createPhraseMatcher({
      parent: client.locationPath(projectId, 'us-central1'),
      phraseMatcher: {
        displayName: 'PHONE_SERVICE',
        type: 'ANY_OF',
        active: true,
        phraseMatchRuleGroups: [
          {
            type: 'ANY_OF',
            phraseMatchRules: [
              {
                query: 'PHONE',
                config: {
                  exactMatchConfig: {},
                },
              },
              {
                query: 'CELLPHONE',
                config: {
                  exactMatchConfig: {},
                },
              },
            ],
          },
        ],
      },
    });
    console.info(`Created ${phraseMatcher.name}`);
  }
  createPhraseMatcherAnyOf();
  // [END contactcenterinsights_create_phrase_matcher_any_of]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
