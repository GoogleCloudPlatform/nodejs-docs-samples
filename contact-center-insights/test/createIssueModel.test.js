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

const {assert} = require('chai');
const {after, before, describe, it} = require('mocha');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const {
  ContactCenterInsightsClient,
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

describe.skip('CreateIssueModel', () => {
  const minConversationCount = 10000;
  const pageSize = 1000;
  let projectId;
  let conversationCount;
  let issueModelName;

  before(async () => {
    projectId = await client.getProjectId();

    // Check if the project has the minimum number of conversations required to create an issue model.
    // See https://cloud.google.com/contact-center/insights/docs/topic-model.
    conversationCount = 0;
    let pageToken = '';
    let listResponse;
    while (conversationCount < minConversationCount) {
      if (pageToken) {
        [listResponse] = await client.listConversations({
          parent: client.locationPath(projectId, 'us-central1'),
          pageSize: pageSize,
          pageToken: pageToken,
        });
      } else {
        [listResponse] = await client.listConversations({
          parent: client.locationPath(projectId, 'us-central1'),
          pageSize: pageSize,
        });
      }

      if (!listResponse.conversations) {
        break;
      }
      conversationCount += listResponse.conversations.length;

      if (!listResponse.nextPageToken) {
        break;
      }
      pageToken = listResponse.nextPageToken;
    }
  });

  after(async () => {
    if (conversationCount >= minConversationCount) {
      client.deleteIssueModel({
        name: issueModelName,
      });
    }
  });

  it('should create an issue model', async () => {
    if (conversationCount >= minConversationCount) {
      const stdout = execSync(`node ./createIssueModel.js ${projectId}`);
      issueModelName = stdout.slice(8);
      assert.match(
        stdout,
        new RegExp(
          'Created projects/[0-9]+/locations/us-central1/issueModels/[0-9]+'
        )
      );
    }
  });
});
