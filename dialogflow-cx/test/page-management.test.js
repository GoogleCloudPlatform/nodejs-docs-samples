// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid');
const execSync = require('child_process').execSync;
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

describe('should test page management functions', async () => {
  const location = 'global';
  const projectId = process.env.GCLOUD_PROJECT;
  const flowId = '00000000-0000-0000-0000-000000000000';
  const pageName = `temp_page_${uuid.v4()}`;
  const agentID = 'b1808233-450b-4065-9492-bc9b40151641';
  let pageID = '';

  it('should create a page', async () => {
    const cmd = 'node create-page.js';
    const temp = `${cmd} ${projectId} ${agentID} ${flowId} ${location} ${pageName}`;
    const output = exec(temp);
    assert.include(output, pageName);
  });

  it('should list pages', async () => {
    const cmd = 'node list-page.js';
    const output = exec(`${cmd} ${projectId} ${agentID} ${flowId} global`);
    assert.include(output, pageName);
  });

  it('should delete a page', async () => {
    const {PagesClient, protos} = require('@google-cloud/dialogflow-cx');
    const pagesClient = new PagesClient();
    const listPageRequest =
      new protos.google.cloud.dialogflow.cx.v3.ListPagesRequest();

    listPageRequest.parent =
      'projects/' +
      projectId +
      '/locations/' +
      location +
      '/agents/' +
      agentID +
      '/flows/' +
      flowId;
    listPageRequest.languageCode = 'en';

    const response = await pagesClient.listPages(listPageRequest);

    for (let i = 0; i < response[0].length; i++) {
      if (response[0][i].displayName === pageName) {
        pageID = response[0][i].name.split('/')[9];
      }
    }

    const cmd = 'node delete-page.js';
    const temp = `${cmd} ${projectId} ${agentID} ${flowId} ${pageID} global`;
    const output = exec(temp);
    assert.strictEqual(output.includes('['), true);
  });
});
