// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var proxyquire = require('proxyquire').noCallThru();

var method = 'POST';
var query = 'giraffe';
var SLACK_TOKEN = 'slack-token';
var KG_API_KEY = 'kg-api-key';

function getSample () {
  var config = {
    SLACK_TOKEN: SLACK_TOKEN,
    KG_API_KEY: KG_API_KEY
  };
  var kgsearch = {
    entities: {
      search: sinon.stub().callsArg(1)
    }
  };
  var googleapis = {
    kgsearch: sinon.stub().returns(kgsearch)
  };
  return {
    sample: proxyquire('../../functions/slack', {
      googleapis: googleapis,
      './config.json': config
    }),
    mocks: {
      googleapis: googleapis,
      kgsearch: kgsearch,
      config: config
    }
  };
}

function getMocks () {
  var req = {
    headers: {},
    query: {},
    body: {},
    get: function (header) {
      return this.headers[header];
    }
  };
  sinon.spy(req, 'get');
  var res = {
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
    }
  };
  sinon.spy(res, 'status');
  sinon.spy(res, 'set');
  return {
    req: req,
    res: res
  };
}

describe('functions:slack', function () {
  it('Send fails if not a POST request', function () {
    var expectedMsg = 'Only POST requests are accepted';
    var mocks = getMocks();

    getSample().sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 405);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Throws if invalid slack token', function () {
    var expectedMsg = 'Invalid credentials';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.body.token = 'wrong';
    var slackSample = getSample();
    slackSample.sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 401);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Handles search error', function () {
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.body.token = SLACK_TOKEN;
    mocks.req.body.text = query;
    var slackSample = getSample();
    slackSample.mocks.kgsearch.entities.search = sinon.stub().callsArgWith(1, 'error');
    slackSample.sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 500);
    assert.equal(mocks.res.send.called, false);
    assert(console.error.calledWith('error'));
  });

  it('Makes search request, receives empty results', function () {
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.body.token = SLACK_TOKEN;
    mocks.req.body.text = query;
    var slackSample = getSample();
    slackSample.mocks.kgsearch.entities.search = sinon.stub().callsArgWith(1, null, {
      itemListElement: []
    });
    slackSample.sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.called, false);
    assert.equal(mocks.res.json.called, true);
    assert.deepEqual(mocks.res.json.firstCall.args[0], {
      text: 'Query: ' + query,
      response_type: 'in_channel',
      attachments: [
        {
          text: 'No results match your query...'
        }
      ]
    });
  });

  it('Makes search request, receives non-empty results', function () {
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.body.token = SLACK_TOKEN;
    mocks.req.body.text = query;
    var slackSample = getSample();
    slackSample.mocks.kgsearch.entities.search = sinon.stub().callsArgWith(1, null, {
      itemListElement: [
        {
          result: {
            name: 'Giraffe',
            description: 'Animal',
            detailedDescription: {
              url: 'http://domain.com/giraffe',
              articleBody: 'giraffe is a tall animal'
            },
            image: {
              contentUrl: 'http://domain.com/image.jpg'
            }
          }
        }
      ]
    });
    slackSample.sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.called, false);
    assert.equal(mocks.res.json.called, true);
    assert.deepEqual(mocks.res.json.firstCall.args[0], {
      text: 'Query: ' + query,
      response_type: 'in_channel',
      attachments: [
        {
          color: '#3367d6',
          title: 'Giraffe: Animal',
          title_link: 'http://domain.com/giraffe',
          text: 'giraffe is a tall animal',
          image_url: 'http://domain.com/image.jpg'
        }
      ]
    });
  });

  it('Makes search request, receives non-empty results but partial data', function () {
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.body.token = SLACK_TOKEN;
    mocks.req.body.text = query;
    var slackSample = getSample();
    slackSample.mocks.kgsearch.entities.search = sinon.stub().callsArgWith(1, null, {
      itemListElement: [
        {
          result: {
            name: 'Giraffe',
            detailedDescription: {},
            image: {}
          }
        }
      ]
    });
    slackSample.sample.kgSearch(mocks.req, mocks.res);

    assert.equal(mocks.res.status.called, false);
    assert.equal(mocks.res.json.called, true);
    assert.deepEqual(mocks.res.json.firstCall.args[0], {
      text: 'Query: ' + query,
      response_type: 'in_channel',
      attachments: [
        {
          color: '#3367d6',
          title: 'Giraffe'
        }
      ]
    });
  });
});
