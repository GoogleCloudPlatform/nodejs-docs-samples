// Copyright 2017 Google LLC
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

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');
const crypto = require('crypto');

const {getFunction} = require('@google-cloud/functions-framework/testing');

const method = 'POST';
const query = 'giraffe';
process.env.SLACK_SECRET = process.env.SLACK_SECRET || 'slack-token';
process.env.KG_API_KEY = process.env.KG_API_KEY || 'test-kg-api-key';

const SLACK_SECRET = process.env.SLACK_SECRET;
const KG_API_KEY = process.env.KG_API_KEY;

const signMockRequest = (req, bodyText, isValid = true) => {
  req.body = {text: bodyText};
  req.rawBody = JSON.stringify(req.body);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  let signature;
  if (!isValid) {
    signature = 'v0=invalid_signature_hash_for_testing';
  } else {
    const baseString = `v0:${timestamp}:${req.rawBody}`;
    signature =
      'v0=' +
      crypto
        .createHmac('sha256', SLACK_SECRET)
        .update(baseString, 'utf8')
        .digest('hex');
  }

  req.headers['x-slack-request-timestamp'] = timestamp;
  req.headers['x-slack-signature'] = signature;
};

const getSample = () => {
  const config = {
    SLACK_SECRET: SLACK_SECRET,
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
      '@googleapis/kgsearch': googleapis,
      process: {env: config},
    }),
    mocks: {
      googleapis: googleapis,
      kgsearch: kgsearch,
      config: config,
    },
  };
};

const getMocks = () => {
  const req = {
    headers: {},
    query: {},
    body: {},
    get: function (header) {
      return this.headers[header];
    },
  };
  sinon.spy(req, 'get');
  const res = {
    headers: {},
    send: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis(),
    status: function (statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    set: function (header, value) {
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
};

const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

//Restore console
const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};
beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_slack_search', () => {
  before(async () => {
    require('../index.js');
  });
  it('Send fails if not a POST request', async () => {
    const error = new Error('Only POST requests are accepted');
    error.code = 405;
    const mocks = getMocks();

    const kgSearch = getFunction('kgSearch');

    try {
      await kgSearch(mocks.req, mocks.res);
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
});

describe('functions_slack_search functions_verify_webhook', () => {
  it('Throws if invalid slack token', async () => {
    const error = new Error('Invalid Slack signature.');
    error.code = 401;
    const mocks = getMocks();
    getSample();

    mocks.req.method = method;
    signMockRequest(mocks.req, 'not empty', false);

    const kgSearch = getFunction('kgSearch');

    try {
      await kgSearch(mocks.req, mocks.res);
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
});

describe('functions_slack_request functions_slack_search functions_verify_webhook', () => {
  it('Handles search error', async () => {
    const error = new Error('error');
    const mocks = getMocks();
    const sample = getSample();

    mocks.req.method = method;
    signMockRequest(mocks.req, query, true);
    sample.mocks.kgsearch.entities.search.yields(error);

    const kgSearch = getFunction('kgSearch');

    try {
      await kgSearch(mocks.req, mocks.res);
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
});

describe('functions_slack_format functions_slack_request functions_slack_search functions_verify_webhook', () => {
  it('Makes search request, receives empty results', async () => {
    const mocks = getMocks();
    const sample = getSample();

    mocks.req.method = method;
    signMockRequest(mocks.req, query, true);
    sample.mocks.kgsearch.entities.search.yields(null, {
      data: {itemListElement: []},
    });

    const kgSearch = getFunction('kgSearch');

    await kgSearch(mocks.req, mocks.res);
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
    signMockRequest(mocks.req, query, true);
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

    const kgSearch = getFunction('kgSearch');

    await kgSearch(mocks.req, mocks.res);
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
    signMockRequest(mocks.req, query, true);
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

    const kgSearch = getFunction('kgSearch');

    await kgSearch(mocks.req, mocks.res);
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
});
