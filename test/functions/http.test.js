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

var test = require('ava');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var requestPromise = sinon.stub().returns(new Promise(function (resolve) {
    resolve('test');
  }));
  return {
    sample: proxyquire('../../functions/http', {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

function getMocks () {
  var req = {
    headers: {},
    get: function (header) {
      return this.headers[header];
    }
  };
  sinon.spy(req, 'get');
  return {
    req: req,
    res: {
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      end: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis()
    }
  };
}

test.before(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('http:helloworld: should error with no message', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.body = {};
  httpSample.sample.helloWorld(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], 'No message defined!');
});

test('http:helloworld: should log message', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.body = {
    message: 'hi'
  };
  httpSample.sample.helloWorld(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.end.calledOnce, true);
  t.is(console.log.calledWith('hi'), true);
});

test('http:helloHttp: should handle GET', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.method = 'GET';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], 'Hello World!');
});

test('http:helloHttp: should handle PUT', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.method = 'PUT';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 403);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], 'Forbidden!');
});

test('http:helloHttp: should handle other methods', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.method = 'POST';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 500);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], { error: 'Something blew up!' });
});

test('http:helloContent: should handle application/json', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/json';
  mocks.req.body = { name: 'John' };
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

test('http:helloContent: should handle application/octet-stream', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/octet-stream';
  if (typeof Buffer.from === 'function') {
    mocks.req.body = Buffer.from('John');
  } else {
    mocks.req.body = new Buffer('John');
  }
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

test('http:helloContent: should handle text/plain', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.headers['content-type'] = 'text/plain';
  mocks.req.body = 'John';
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

test('http:helloContent: should handle application/x-www-form-urlencoded', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/x-www-form-urlencoded';
  mocks.req.body = { name: 'John' };
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

test('http:helloContent: should handle other', function (t) {
  var mocks = getMocks();
  var httpSample = getSample();
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.deepEqual(mocks.res.send.firstCall.args[0], 'Hello World!');
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
