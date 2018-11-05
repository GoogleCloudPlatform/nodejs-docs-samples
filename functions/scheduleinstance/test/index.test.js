
/**
 * Copyright 2018, Google, Inc.
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
const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

function getSample () {
  const requestPromise = sinon.stub().returns(new Promise((resolve) => resolve(`request sent`)));

  return {
    program: proxyquire(`../`, {
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
    body: {},
    get: function (header) {
      return this.headers[header];
    }
  };
  sinon.spy(req, `get`);

  const res = {
    set: sinon.stub().returnsThis(),
    send: function (message) {
      this.message = message;
      return this;
    },
    json: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis(),
    status: function (statusCode) {
      this.statusCode = statusCode;
      return this;
    }
  };
  sinon.spy(res, 'status');
  sinon.spy(res, 'send');

  const event = {
    data: {
      data: {}
    }
  };

  const callback = sinon.spy();

  return {
    req: req,
    res: res,
    event: event,
    callback: callback
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

/////////////////////////// startInstanceHttp //////////////////////////////

test(`startInstanceHttp: should accept application/json`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {zone: `test-zone`, instance: `test-instance`};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`startInstanceHttp: should accept application/octect-stream`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/octet-stream`;
  mocks.req.body = Buffer.from(`{'zone': 'test-zone', 'instance': 'test-instance'}`);
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`startInstanceHttp: should fail missing HTTP request method`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP method undefined; use method POST'});
});

test(`startInstanceHttp: should reject HTTP GET request`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `GET`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP method GET; use method POST'});
});

test(`startInstanceHttp: should fail missing content-type header`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'HTTP content-type missing'});
});

test(`startInstanceHttp: should reject unsupported HTTP content-type`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `text/plain`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP content-type text/plain; use application/json or application/octet-stream'});
});

test(`startInstanceHttp: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'instance': 'test-instance'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'zone' missing from payload`});
});

test(`startInstanceHttp: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone'};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'instance' missing from payload`});
});

test(`startInstanceHttp: should fail with empty request body`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {};
  sample.program.startInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'zone' missing from payload`});
});

/////////////////////////// stopInstanceHttp //////////////////////////////

test(`stopInstanceHttp: should accept application/json`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {zone: `test-zone`, instance: `test-instance`};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`stopInstanceHttp: should accept application/octect-stream`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/octet-stream`;
  mocks.req.body = Buffer.from(`{'zone': 'test-zone', 'instance': 'test-instance'}`);
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`stopInstanceHttp: should fail missing HTTP request method`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP method undefined; use method POST'});
});

test(`stopInstanceHttp: should reject HTTP GET request`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `GET`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP method GET; use method POST'});
});

test(`stopInstanceHttp: should fail missing content-type header`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'HTTP content-type missing'});
});

test(`stopInstanceHttp: should reject unsupported HTTP content-type`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `text/plain`;
  mocks.req.body = {'zone': 'test-zone', 'instance': 'test-instance'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: 'Unsupported HTTP content-type text/plain; use application/json or application/octet-stream'});
});

test(`stopInstanceHttp: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'instance': 'test-instance'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'zone' missing from payload`});
});

test(`stopInstanceHttp: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {'zone': 'test-zone'};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'instance' missing from payload`});
});

test(`stopInstanceHttp: should fail with empty request body`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {};
  sample.program.stopInstanceHttp(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error: `Attribute 'zone' missing from payload`});
});

/////////////////////////// startInstancePubSub //////////////////////////////

test(`startInstancePubSub: should accept JSON-formatted event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone', 'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`startInstancePubSub: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

test(`startInstancePubSub: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'instance' missing from payload`));
});

test(`startInstancePubSub: should fail with empty event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.startInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

/////////////////////////// stopInstancePubSub //////////////////////////////

test(`stopInstancePubSub: should accept JSON-formatted event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone', 'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  sample.mocks.requestPromise()
    .then((data) => {
      // The request was successfully sent.
      t.deepEqual(data, 'request sent');
    });
});

test(`stopInstancePubSub: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'instance': 'test-instance'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});

test(`stopInstancePubSub: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {'zone': 'test-zone'};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'instance' missing from payload`));
});

test(`stopInstancePubSub: should fail with empty event payload`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  const pubsubData = {};
  mocks.event.data.data = Buffer.from(JSON.stringify(pubsubData)).toString('base64');
  sample.program.stopInstancePubSub(mocks.event, mocks.callback);

  t.deepEqual(mocks.callback.firstCall.args[0], new Error(`Attribute 'zone' missing from payload`));
});
