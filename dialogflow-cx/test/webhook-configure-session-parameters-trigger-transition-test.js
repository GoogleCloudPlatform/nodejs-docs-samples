// Copyright 2022 Google LLC
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

const {assert} = require('chai');
const {describe, it} = require('mocha');
const uuid = require('uuid');
const webhook = require('../webhook-configure-session-parameters-trigger-transition.js');

// variables to construct path to target page
const location = 'global';
const projectId = process.env.GCLOUD_PROJECT;
const flowId = '00000000-0000-0000-0000-000000000000';
const pageId = `temp_page_${uuid.v4()}`;
const agentId = '4e2cb784-012c-48b2-9d8c-a877d3be3437';
const targetPage = `projects/${projectId}/locations/${location}/agents/${agentId}/flows/${flowId}/pages/${pageId}`;

const number = 100;

const request = {
  body: {
    targetPage: targetPage,
    fulfillmentInfo: {
      tag: 'configure-session-parameter-trigger-transition',
    },
    sessionInfo: {
      parameters: {
        number: number,
      },
    },
  },
};

describe('trigger transition', () => {
  it('should test that webhook response contains target page', async () => {
    const temp = JSON.stringify(request);
    let response = '';

    const res = {
      send: function (s) {
        response = JSON.stringify(s);
      },
    };

    webhook.triggerTransition(JSON.parse(temp), res);
    assert.include(response, pageId);
  });
});
