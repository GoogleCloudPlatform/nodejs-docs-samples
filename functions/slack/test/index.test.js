/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

const method = 'POST';
const query = 'giraffe';
const SLACK_TOKEN = 'slack-token';
const KG_API_KEY = 'kg-api-key';

function getSample() {
  const config = {
    SLACK_TOKEN: SLACK_TOKEN,
    KG_API_KEY: KG_API_KEY,
  };
  const kgsearch = {
    entities: {
      search: sinon.stub().yields(),
    },
  };
  const googleapis = {
    kgsearch: sinon.stub().returns(kgsearch),
  };

  return {
    program: proxyquire('../', {
      googleapis: {google: googleapis},
      './config.json': config,
    }),
    mocks: {
      googleapis: googleapis,
      kgsearch: kgsearch,
      config: config,
    },
  };
}

function getMocks() {
  const req = {
    headers: {},
    query: {},
    body: {},
    get: function(header) {
      return this.headers[header];
    },
  };
  sinon.spy(req, 'get');
  const res = {
    headers: {},
    send: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis(),
    status: function(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    set: function(header, value) {
      this.headers[header] = value;
      return this;
    },
  };
  sinon.spy(res, 'status');
  sinon.spy(res, 'set');
  return {
    req: req,
    res: res,
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('Send fails if not a POST request', async () => {
  const error = new Error('Only POST requests are accepted');
  error.code = 405;
  const mocks = getMocks();
  const sample = getSample();

  try {
    await sample.program.kgSearch(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
    assert.strictEqual(mocks.res.status.callCount, 1);
    assert.deepStrictEqual(mocks.res.status.firstCall.args, [error.code]);
    assert.strictEqual(mocks.res.send.callCount, 1);
    assert.deepStrictEqual(mocks.res.send.firstCall.args, [error]);
    assert.strictEqual(console.error.callCount, 1);
    assert.deepStrictEqual(console.error.firstCall.args, [error]);
  }
});

it('Throws if invalid slack token', async () => {
  const error = new Error('Invalid credentials');
  error.code = 401;
  const mocks = getMocks();
  const sample = getSample();

  mocks.req.method = method;
  mocks.req.body.token = 'wrong';

  try {
    await sample.program.kgSearch(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
    assert.strictEqual(mocks.res.status.callCount, 1);
    assert.deepStrictEqual(mocks.res.status.firstCall.args, [error.code]);
    assert.strictEqual(mocks.res.send.callCount, 1);
    assert.deepStrictEqual(mocks.res.send.firstCall.args, [error]);
    assert.strictEqual(console.error.callCount, 1);
    assert.deepStrictEqual(console.error.firstCall.args, [error]);
  }
});

it('Handles search error', async () => {
  const error = new Error('error');
  const mocks = getMocks();
  const sample = getSample();

  mocks.req.method = method;
  mocks.req.body.token = SLACK_TOKEN;
  mocks.req.body.text = query;
  sample.mocks.kgsearch.entities.search.yields(error);

  try {
    await sample.program.kgSearch(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
    assert.strictEqual(mocks.res.status.callCount, 1);
    assert.deepStrictEqual(mocks.res.status.firstCall.args, [500]);
    assert.strictEqual(mocks.res.send.callCount, 1);
    assert.deepStrictEqual(mocks.res.send.firstCall.args, [error]);
    assert.strictEqual(console.error.callCount, 1);
    assert.deepStrictEqual(console.error.firstCall.args, [error]);
  }
});

it('Makes search request, receives empty results', async () => {
  const mocks = getMocks();
  const sample = getSample();

  mocks.req.method = method;
  mocks.req.body.token = SLACK_TOKEN;
  mocks.req.body.text = query;
  sample.mocks.kgsearch.entities.search.yields(null, {
    data: {itemListElement: []},
  });

  await sample.program.kgSearch(mocks.req, mocks.res);
  assert.strictEqual(mocks.res.json.callCount, 1);
  assert.deepStrictEqual(mocks.res.json.firstCall.args, [
    {
      text: `Query: ${query}`,
      response_type: 'in_channel',
      attachments: [
        {
          text: 'No results match your query...',
        },
      ],
    },
  ]);
});

it('Makes search request, receives non-empty results', async () => {
  const mocks = getMocks();
  const sample = getSample();

  mocks.req.method = method;
  mocks.req.body.token = SLACK_TOKEN;
  mocks.req.body.text = query;
  sample.mocks.kgsearch.entities.search.yields(null, {
    data: {
      itemListElement: [
        {
          result: {
            name: 'Giraffe',
            description: 'Animal',
            detailedDescription: {
              url: 'http://domain.com/giraffe',
              articleBody: 'giraffe is a tall animal',
            },
            image: {
              contentUrl: 'http://domain.com/image.jpg',
            },
          },
        },
      ],
    },
  });

  await sample.program.kgSearch(mocks.req, mocks.res);
  assert.strictEqual(mocks.res.json.callCount, 1);
  assert.deepStrictEqual(mocks.res.json.firstCall.args, [
    {
      text: `Query: ${query}`,
      response_type: 'in_channel',
      attachments: [
        {
          color: '#3367d6',
          title: 'Giraffe: Animal',
          title_link: 'http://domain.com/giraffe',
          text: 'giraffe is a tall animal',
          image_url: 'http://domain.com/image.jpg',
        },
      ],
    },
  ]);
});

it('Makes search request, receives non-empty results but partial data', async () => {
  const mocks = getMocks();
  const sample = getSample();

  mocks.req.method = method;
  mocks.req.body.token = SLACK_TOKEN;
  mocks.req.body.text = query;
  sample.mocks.kgsearch.entities.search.yields(null, {
    data: {
      itemListElement: [
        {
          result: {
            name: 'Giraffe',
            detailedDescription: {},
            image: {},
          },
        },
      ],
    },
  });

  await sample.program.kgSearch(mocks.req, mocks.res);
  assert.strictEqual(mocks.res.json.callCount, 1);
  assert.deepStrictEqual(mocks.res.json.firstCall.args, [
    {
      text: `Query: ${query}`,
      response_type: 'in_channel',
      attachments: [
        {
          color: '#3367d6',
          title: 'Giraffe',
        },
      ],
    },
  ]);
});
