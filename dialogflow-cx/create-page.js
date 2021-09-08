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

'use strict';

const {PagesClient} = require('@google-cloud/dialogflow-cx');

async function main(projectId, agentId, flowId, location, displayName) {
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const agentId = 'my-agent';
  // const flowId = 'my-flow';
  // const displayName = 'my-display-name';
  // const location = 'global';

  // [START dialogflow_cx_create_page_sample]
  async function createPage(projectId, agentId, flowId, location, displayName) {
    const pagesClient = new PagesClient();

    const createPageRequest = {
      parent: `projects/${projectId}/locations/${location}/agents/${agentId}/flows/${flowId}`,
      page: {
        displayName: displayName,
      },
    };

    const response = await pagesClient.createPage(createPageRequest);
    console.log(response);
  }
  // [END dialogflow_cx_create_page_sample]

  await createPage(projectId, agentId, flowId, location, displayName);
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
