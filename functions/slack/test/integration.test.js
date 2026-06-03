// Copyright 2022 Google LLC
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

const assert = require('assert');
const crypto = require('crypto');
const supertest = require('supertest');
const functionsFramework = require('@google-cloud/functions-framework/testing');
const nock = require('nock');

process.env.SLACK_SECRET = process.env.SLACK_SECRET || 'test-slack-secret';
const SLACK_SECRET = process.env.SLACK_SECRET;
const SLACK_TIMESTAMP = Math.floor(Date.now() / 1000).toString();

require('../index');

const generateSignature = query => {
  const body = JSON.stringify({text: query});

  const buf = Buffer.from(body);
  const plaintext = `v0:${SLACK_TIMESTAMP}:${buf}`;

  const hmac = crypto.createHmac('sha256', SLACK_SECRET);
  hmac.update(plaintext);
  const ciphertext = hmac.digest('hex');

  return `v0=${ciphertext}`;
};

describe('functions_slack_format functions_slack_request functions_slack_search functions_verify_webhook', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('returns search results', async () => {
    const query = 'kolach';

    // Mock: Intercept the Google API request and return the expected data
    nock('https://kgsearch.googleapis.com')
      .get('/v1/entities:search')
      .query(true)
      .reply(200, {
        itemListElement: [
          {
            result: {
              name: 'Kolach',
              description: 'Pastry',
              detailedDescription: {
                articleBody:
                  'A kolach is a pastry that holds a portion of fruit surrounded by puffy dough.',
                url: 'http://domain.com/kolach',
              },
            },
          },
        ],
      });

    const server = functionsFramework.getTestServer('kgSearch');
    const response = await supertest(server)
      .post('/')
      .set({
        'x-slack-signature': generateSignature(query),
        'x-slack-request-timestamp': SLACK_TIMESTAMP,
      })
      .send({text: query})
      .expect(200);

    const results = response.body && response.body.attachments;
    assert.ok(results);

    const result = results[0];

    assert.ok(result);
    assert.ok(result.text);
    assert.ok(result.title);
    assert.ok(result.title.toLowerCase().includes('kolach'));
  });

  it('handles non-existent query', async () => {
    const query = 'g1bb3r1shhhhhhh';

    nock('https://kgsearch.googleapis.com')
      .get('/v1/entities:search')
      .query(true)
      .reply(200, {
        itemListElement: [],
      });

    const server = functionsFramework.getTestServer('kgSearch');
    const response = await supertest(server)
      .post('/')
      .set({
        'x-slack-signature': generateSignature(query),
        'x-slack-request-timestamp': SLACK_TIMESTAMP,
      })
      .send({text: query})
      .expect(200);

    const results = response.body && response.body.attachments;
    assert.ok(results);

    const result = results[0];
    assert.ok(result);
    assert.ok(result.text);
    assert.ok(result.text.includes('No results'));
  });

  it('handles empty query', async () => {
    const query = '';

    const server = functionsFramework.getTestServer('kgSearch');
    await supertest(server)
      .post('/')
      .set({
        'x-slack-signature': generateSignature(query),
        'x-slack-request-timestamp': SLACK_TIMESTAMP,
      })
      .send({text: query})
      .expect(400);
  });

  it('fails on missing signature', async () => {
    const query = 'kolach';

    const server = functionsFramework.getTestServer('kgSearch');
    await supertest(server).post('/').send({text: query}).expect(400);
  });
});
