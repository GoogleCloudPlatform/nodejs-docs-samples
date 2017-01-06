/**
 * Copyright 2016, Google, Inc.
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

require(`../../../test/_setup`);

const proxyquire = require('proxyquire').noCallThru();

function getSample () {
  const requestPromise = sinon.stub().returns(new Promise((resolve) => resolve(`test`)));

  return {
    sample: proxyquire(`../`, {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

function getMocks () {
  const req = {
    headers: {},
    get: function (header) {
      return this.headers[header];
    }
  };
  sinon.spy(req, `get`);

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

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial(`http:helloworld: should error with no message`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.body = {};
  httpSample.sample.helloWorld(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.is(mocks.res.send.firstCall.args[0], `No message defined!`);
});

test.serial(`http:helloworld: should log message`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.body = {
    message: `hi`
  };
  httpSample.sample.helloWorld(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.end.calledOnce);
  t.true(console.log.calledWith(`hi`));
});

test.serial(`http:helloHttp: should handle GET`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = `GET`;
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.is(mocks.res.send.firstCall.args[0], `Hello World!`);
});

test.serial(`http:helloHttp: should handle PUT`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = `PUT`;
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 403);
  t.true(mocks.res.send.calledOnce);
  t.is(mocks.res.send.firstCall.args[0], `Forbidden!`);
});

test.serial(`http:helloHttp: should handle other methods`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.method = `POST`;
  httpSample.sample.helloHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 500);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], { error: `Something blew up!` });
});

test.serial(`http:helloContent: should handle application/json`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = { name: `John` };
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
});

test.serial(`http:helloContent: should handle application/octet-stream`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers[`content-type`] = `application/octet-stream`;
  mocks.req.body = new Buffer(`John`);
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
});

test.serial(`http:helloContent: should handle text/plain`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers[`content-type`] = `text/plain`;
  mocks.req.body = `John`;
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
});

test.serial(`http:helloContent: should handle application/x-www-form-urlencoded`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  mocks.req.headers[`content-type`] = `application/x-www-form-urlencoded`;
  mocks.req.body = { name: `John` };
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
});

test.serial(`http:helloContent: should handle other`, (t) => {
  const mocks = getMocks();
  const httpSample = getSample();
  httpSample.sample.helloContent(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], `Hello World!`);
});
