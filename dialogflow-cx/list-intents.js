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

async function main(projectId, location, agentId) {
  // [START dialogflow_cx_list_intents]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my-project';
  // const location = 'global';
  // const agentId = 'my-agent';

  // Imports the Google Cloud Some API library
  const {IntentsClient} = require('@google-cloud/dialogflow-cx');
  /**
   * Example for regional endpoint:
   *   const location = 'us-central1'
   *   const client = new SessionsClient({apiEndpoint: 'us-central1-dialogflow.googleapis.com'})
   */
  const client = new IntentsClient();

  async function listIntents() {
    const parent = client.agentPath(projectId, location, agentId);
    console.info(parent);

    const [intents] = await client.listIntents({
      parent,
      pageSize: 100,
    });
    intents.forEach(intent => {
      console.log('====================');
      console.log(`Intent name: ${intent.name}`);
      console.log(`Intent display name: ${intent.displayName}`);
      console.log(`# Parameters: ${intent.parameters.length}`);
      console.log(`# Training Phrases: ${intent.trainingPhrases.length}`);
    });
  }

  listIntents();
  // [END dialogflow_cx_list_intents]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
