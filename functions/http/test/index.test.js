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

const Buffer = require('safe-buffer').Buffer;
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const uuid = require('uuid');
const tools = require('@google-cloud/nodejs-repo-tools');

function getSample() {
  const requestPromise = sinon
    .stub()
    .returns(new Promise(resolve => resolve('test')));

  return {
    sample: proxyquire('../', {
      'request-promise': requestPromise,
    }),
    mocks: {
      requestPromise: requestPromise,
    },
  };
}

function getMocks() {
  const req = {
    headers: {},
    get: function(header) {
      return this.headers[header];
    },
  };
  sinon.spy(req, 'get');

  const corsPreflightReq = {
    method: 'OPTIONS',
  };

  const corsMainReq = {
    method: 'GET',
  };

  return {
    req: req,
    corsPreflightReq: corsPreflightReq,
    corsMainReq: corsMainReq,
    res: {
      set: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      end: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('http:helloHttp: should handle GET', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = 'GET';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello World!');
});

it('http:helloHttp: should handle PUT', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = 'PUT';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 403);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Forbidden!');
});

it('http:helloHttp: should handle other methods', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = 'POST';
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 405);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.deepStrictEqual(mocks.res.send.firstCall.args[0], {
    error: 'Something blew up!',
  });
});

it('http:helloContent: should handle application/json', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/json';
  mocks.req.body = {name: 'John'};
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

it('http:helloContent: should handle application/octet-stream', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/octet-stream';
  mocks.req.body = Buffer.from('John');
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

it('http:helloContent: should handle text/plain', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers['content-type'] = 'text/plain';
  mocks.req.body = 'John';
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

it('http:helloContent: should handle application/x-www-form-urlencoded', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers['content-type'] = 'application/x-www-form-urlencoded';
  mocks.req.body = {name: 'John'};
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
});

it('http:helloContent: should handle other', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello World!');
});

it('http:helloContent: should escape XSS', () => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers['content-type'] = 'text/plain';
  mocks.req.body = {name: '<script>alert(1)</script>'};
  httpSample.sample.helloContent(mocks.req, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnce, true);
  assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
  assert.strictEqual(mocks.res.send.calledOnce, true);
  assert.strictEqual(
    mocks.res.send.firstCall.args[0].includes('<script>'),
    false
  );
});

it('http:cors: should respond to preflight request (no auth)', () => {
  const mocks = getMocks();
  const httpSample = getSample();

  httpSample.sample.corsEnabledFunction(mocks.corsPreflightReq, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnceWith(204), true);
  assert.strictEqual(mocks.res.send.called, true);
});

it('http:cors: should respond to main request (no auth)', () => {
  const mocks = getMocks();
  const httpSample = getSample();

  httpSample.sample.corsEnabledFunction(mocks.corsMainReq, mocks.res);

  assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
});

it('http:cors: should respond to preflight request (auth)', () => {
  const mocks = getMocks();
  const httpSample = getSample();

  httpSample.sample.corsEnabledFunctionAuth(mocks.corsPreflightReq, mocks.res);

  assert.strictEqual(mocks.res.status.calledOnceWith(204), true);
  assert.strictEqual(mocks.res.send.calledOnce, true);
});

it('http:cors: should respond to main request (auth)', () => {
  const mocks = getMocks();
  const httpSample = getSample();

  httpSample.sample.corsEnabledFunctionAuth(mocks.corsMainReq, mocks.res);

  assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
});

it('http:getSignedUrl: should process example request', async () => {
  const mocks = getMocks();
  const httpSample = getSample();

  const reqMock = {
    method: 'POST',
    body: {
      bucket: 'nodejs-docs-samples',
      filename: `gcf-gcs-url-${uuid.v4}`,
      contentType: 'application/octet-stream',
    },
  };

  httpSample.sample.getSignedUrl(reqMock, mocks.res);

  // Instead of modifying the sample to return a promise,
  // use a delay here and keep the sample idiomatic
  await new Promise(resolve => setTimeout(resolve, 300));

  assert.strictEqual(mocks.res.status.called, false);
  assert.strictEqual(mocks.res.send.calledOnce, true);
});
