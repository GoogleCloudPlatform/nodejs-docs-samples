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

  return {
    req: req,
    res: res
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`startInstance: should accept application/json`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {zone:`test-zone`, instance:`test-instance`};
  sample.program.startInstance(mocks.req, mocks.res);

  sample.mocks.requestPromise()
      .then((data) => {
        // The request was successfully sent.
        t.deepEqual(data, 'request sent');
      });
});

test(`startInstance: should accept application/octect-stream`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/octet-stream`;
  mocks.req.body = Buffer.from(`{'zone':'test-zone', 'instance':'test-instance'}`);
  sample.program.startInstance(mocks.req, mocks.res);

  sample.mocks.requestPromise()
      .then((data) => {
        // The request was successfully sent.
        t.deepEqual(data, 'request sent');
      });
});

test(`startInstance: should fail missing HTTP request method`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP method undefined; use method POST'});
});

test(`startInstance: should reject HTTP GET request`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `GET`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP method GET; use method POST'});
});

test(`startInstance: should fail missing content-type header`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'HTTP content-type missing'});
});

test(`startInstance: should reject unsupported HTTP content-type`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `text/plain`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP content-type text/plain; use application/json or application/octet-stream'});
});

test(`startInstance: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"instance":"test-instance"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:`Attribute 'zone' missing from POST request`});
});

test(`startInstance: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone"};
  sample.program.startInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:`Attribute 'instance' missing from POST request`});
});

test(`stopInstance: should accept application/json`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {zone:`test-zone`, instance:`test-instance`};
  sample.program.stopInstance(mocks.req, mocks.res);

  sample.mocks.requestPromise()
      .then((data) => {
        // The request was successfully sent.
        t.deepEqual(data, 'request sent');
      });
});

test(`stopInstance: should accept application/octect-stream`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/octet-stream`;
  mocks.req.body = Buffer.from(`{'zone':'test-zone', 'instance':'test-instance'}`);
  sample.program.stopInstance(mocks.req, mocks.res);

  sample.mocks.requestPromise()
      .then((data) => {
        // The request was successfully sent.
        t.deepEqual(data, 'request sent');
      });
});

test(`stopInstance: should fail missing HTTP request method`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP method undefined; use method POST'});
});

test(`stopInstance: should reject HTTP GET request`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `GET`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP method GET; use method POST'});
});

test(`stopInstance: should fail missing content-type header`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'HTTP content-type missing'});
});

test(`stopInstance: should reject unsupported HTTP content-type`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `text/plain`;
  mocks.req.body = {"zone":"test-zone", "instance":"test-instance"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:'Unsupported HTTP content-type text/plain; use application/json or application/octet-stream'});
});

test(`stopInstance: should fail with missing 'zone' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"instance":"test-instance"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:`Attribute 'zone' missing from POST request`});
});

test(`stopInstance: should fail with missing 'instance' attribute`, async (t) => {
  const mocks = getMocks();
  const sample = getSample();
  mocks.req.method = `POST`;
  mocks.req.headers[`content-type`] = `application/json`;
  mocks.req.body = {"zone":"test-zone"};
  sample.program.stopInstance(mocks.req, mocks.res);

  t.true(mocks.res.status.calledOnce);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.true(mocks.res.send.calledOnce);
  t.deepEqual(mocks.res.send.firstCall.args[0], {error:`Attribute 'instance' missing from POST request`});
});
