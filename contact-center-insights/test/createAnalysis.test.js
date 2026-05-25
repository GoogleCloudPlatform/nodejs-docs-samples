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
  // eslint-disable-next-line node/no-missing-require
} = require('@google-cloud/contact-center-insights');
const client = new ContactCenterInsightsClient();

const delay = async (test, addMs) => {
  if (!test) {
    return;
  }
  const retries = test.currentRetry();
  if (addMs) {
    await new Promise(r => setTimeout(r, addMs));
  } // No retry on the first failure.
  if (retries === 0) return;
  // See: https://cloud.google.com/storage/docs/exponential-backoff
  const backoffBase = Math.pow(2, retries) * 1000;
  const jitter = Math.random() * 1000;
  const ms = backoffBase + jitter;
  return new Promise(done => {
    console.info(`retrying "${test.title}" in ${ms}ms`);
    setTimeout(done, ms);
  });
};

describe('CreateAnalysis', () => {
  let projectId;
  let conversationName;

  before(async () => {
    projectId = await client.getProjectId();

    const stdoutCreateConversation = execSync(
      `node ./createConversation.js ${projectId}`
    );
    conversationName = stdoutCreateConversation.slice(8).trim();
    assert.match(
      stdoutCreateConversation,
      new RegExp(
        'Created projects/[0-9]+/locations/us-central1/conversations/[0-9]+'
      )
    );

    console.info('Waiting for conversation to be ready for analysis...');
    await new Promise(resolve => setTimeout(resolve, 15000));
  });

  after(() => {
    client.deleteConversation({
      name: conversationName,
      force: true,
    });
  });

  // eslint-disable-next-line prefer-arrow-callback
  it('should create a conversation and an analysis', async function () {
    this.retries(2);
    await delay(this.test, 4000);
    try {
      const stdoutCreateAnalysis = execSync(
        `node ./createAnalysis.js ${conversationName}`
      );
      assert.match(
        stdoutCreateAnalysis,
        new RegExp(
          'Created projects/[0-9]+/locations/us-central1/conversations/[0-9]+/analyses/[0-9]+'
        )
      );
    } catch (err) {
      console.error('CreateAnalysis failed', err);
      throw err;
    }
  });
});
