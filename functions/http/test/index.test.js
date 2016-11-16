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

describe(`functions:http`, () => {
  it(`http:helloworld: should error with no message`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.body = {};
    httpSample.sample.helloWorld(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], `No message defined!`);
  });

  it(`http:helloworld: should log message`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.body = {
      message: `hi`
    };
    httpSample.sample.helloWorld(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.end.calledOnce, true);
    assert.equal(console.log.calledWith(`hi`), true);
  });

  it(`http:helloHttp: should handle GET`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.method = `GET`;
    httpSample.sample.helloHttp(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], `Hello World!`);
  });

  it(`http:helloHttp: should handle PUT`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.method = `PUT`;
    httpSample.sample.helloHttp(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 403);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], `Forbidden!`);
  });

  it(`http:helloHttp: should handle other methods`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.method = `POST`;
    httpSample.sample.helloHttp(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 500);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], { error: `Something blew up!` });
  });

  it(`http:helloContent: should handle application/json`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers[`content-type`] = `application/json`;
    mocks.req.body = { name: `John` };
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
  });

  it(`http:helloContent: should handle application/octet-stream`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers[`content-type`] = `application/octet-stream`;
    mocks.req.body = new Buffer(`John`);
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
  });

  it(`http:helloContent: should handle text/plain`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers[`content-type`] = `text/plain`;
    mocks.req.body = `John`;
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
  });

  it(`http:helloContent: should handle application/x-www-form-urlencoded`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers[`content-type`] = `application/x-www-form-urlencoded`;
    mocks.req.body = { name: `John` };
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], `Hello John!`);
  });

  it(`http:helloContent: should handle other`, () => {
    const mocks = getMocks();
    const httpSample = getSample();
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.deepEqual(mocks.res.send.firstCall.args[0], `Hello World!`);
  });
});

