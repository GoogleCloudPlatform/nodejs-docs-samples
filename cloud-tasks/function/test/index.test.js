/**
 * Copyright 2019 Google LLC
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

const sg_key = process.env.SENDGRID_API_KEY;

function getSample() {
  const requestPromise = sinon
    .stub()
    .returns(new Promise(resolve => resolve('test')));

  return {
    program: proxyquire('../', {
      'request-promise': requestPromise,
    }),
    mocks: {
      requestPromise: requestPromise,
    },
  };
}

function getMocks() {
  const req = {
    body: {},
  };

  const res = {
    send: sinon.stub().returnsThis(),
    status: function(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
  };
  sinon.spy(res, 'status');
  return {req, res};
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('send fails without API key', async () => {
  process.env = {
    SENDGRID_API_KEY: undefined,
  };
  const mocks = getMocks();
  const sample = getSample();
  const error = new Error(
    'SendGrid API key not provided as environment variable.'
  );
  error.code = 401;

  try {
    await sample.program.sendPostcard(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('send fails without message', async () => {
  process.env = {
    SENDGRID_API_KEY: sg_key,
  };
  const mocks = getMocks();
  mocks.req.body.to_email = 'to@gmail.com';
  mocks.req.body.from_email = 'from@gmail.com';

  const sample = getSample();
  const error = new Error('Email message not provided.');
  error.code = 400;

  try {
    await sample.program.sendPostcard(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('send fails without to email', async () => {
  process.env = {
    SENDGRID_API_KEY: sg_key,
  };
  const mocks = getMocks();
  mocks.req.body.from_email = 'from@gmail.com';
  mocks.req.body.message = 'Hello, World!';

  const sample = getSample();
  const error = new Error('To email address not provided.');
  error.code = 400;

  try {
    await sample.program.sendPostcard(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('send fails without from email', async () => {
  process.env = {
    SENDGRID_API_KEY: sg_key,
  };
  const mocks = getMocks();
  mocks.req.body.to_email = 'to@gmail.com';
  mocks.req.body.message = 'Hello, World!';

  const sample = getSample({
    SENDGRID_API_KEY: sg_key,
  });

  const error = new Error('From email address not provided.');
  error.code = 400;

  try {
    await sample.program.sendPostcard(mocks.req, mocks.res);
  } catch (err) {
    assert.deepStrictEqual(err, error);
  }
});

it('send succeeds', async () => {
  process.env = {
    SENDGRID_API_KEY: sg_key,
  };
  const mocks = getMocks();
  mocks.req.body.to_email = 'to@gmail.com';
  mocks.req.body.from_email = 'from@gmail.com';
  mocks.req.body.message = 'Hello, World!';

  const sample = getSample();
  await sample.program.sendPostcard(mocks.req, mocks.res);
  assert.strictEqual(mocks.res.status.callCount, 1);
  assert.deepStrictEqual(mocks.res.status.firstCall.args, [200]);
  assert.strictEqual(mocks.res.send.callCount, 1);
});
