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

function main(
  projectId,
  transcriptUri = 'gs://cloud-samples-data/ccai/chat_sample.json',
  audioUri = 'gs://cloud-samples-data/ccai/voice_6912.txt'
) {
  // [START contactcenterinsights_create_conversation_with_ttl]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'my_project_id';
  // const transcriptUri = 'gs://cloud-samples-data/ccai/chat_sample.json';
  // const audioUri = 'gs://cloud-samples-data/ccai/voice_6912.txt';

  // Imports the Contact Center Insights client.
  const {
    ContactCenterInsightsClient,
  } = require('@google-cloud/contact-center-insights');

  // Instantiates a client.
  const client = new ContactCenterInsightsClient();

  async function createConversationWithTtl() {
    const [conversation] = await client.createConversation({
      parent: client.locationPath(projectId, 'us-central1'),
      conversation: {
        dataSource: {
          gcsSource: {
            transcriptUri: transcriptUri,
            audioUri: audioUri,
          },
        },
        medium: 'CHAT',
        ttl: {
          seconds: 86400,
        },
      },
    });
    console.info(`Created ${conversation.name}`);
  }
  createConversationWithTtl();
  // [END contactcenterinsights_create_conversation_with_ttl]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
