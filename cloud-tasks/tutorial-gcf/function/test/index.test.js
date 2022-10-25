// Copyright 2019 Google LLC
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

describe('tasks/function', () => {
  let key;

  const getSample = function () {
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
  };

  const getMocks = function () {
    const req = {
      body: {},
    };

    const res = {
      send: sinon.stub().returnsThis(),
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
    };
    sinon.spy(res, 'status');
    return {req, res};
  };

  before(async () => {
    const secrets = new SecretManagerServiceClient();
    const projectId = await secrets.getProjectId();
    const secretName = 'sendgrid-api-key';
    const secretVersion = 1;
    const [version] = await secrets.accessSecretVersion({
      name: secrets.secretVersionPath(projectId, secretName, secretVersion),
    });
    key = version.payload.data.toString();
    process.env.SENDGRID_API_KEY = key;
  });

  beforeEach(() => {
    sinon.spy(console, 'error');
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    console.error.restore();
    console.log.restore();
  });

  it('send fails without API key', async () => {
    process.env = {
      SENDGRID_API_KEY: undefined,
    };
    const mocks = getMocks();
    const sample = getSample();
    const error = new Error(
      'SENDGRID_API_KEY was not provided as environment variable.'
    );
    error.code = 401;

    try {
      await sample.program.sendEmail(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
    }
  });

  it('send fails without sender name', async () => {
    process.env = {
      SENDGRID_API_KEY: key,
    };
    const mocks = getMocks();
    mocks.req.body.to_email = 'to@gmail.com';
    mocks.req.body.to_name = 'testA';

    const sample = getSample();
    const error = new Error('Sender name not provided.');
    error.code = 400;

    try {
      await sample.program.sendEmail(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
    }
  });

  it('send fails without recipient email', async () => {
    process.env = {
      SENDGRID_API_KEY: key,
    };
    const mocks = getMocks();
    mocks.req.body.to_name = 'testA';
    mocks.req.body.from_name = 'testB';

    const sample = getSample();
    const error = new Error('Email address not provided.');
    error.code = 400;

    try {
      await sample.program.sendEmail(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
    }
  });

  it('send fails without recipient name', async () => {
    process.env = {
      SENDGRID_API_KEY: key,
    };
    const mocks = getMocks();
    mocks.req.body.to_email = 'to@gmail.com';
    mocks.req.body.from_name = 'testB';

    const sample = getSample({
      SENDGRID_API_KEY: key,
    });

    const error = new Error('Recipient name not provided.');
    error.code = 400;

    try {
      await sample.program.sendEmail(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
    }
  });

  it('send succeeds', async () => {
    process.env = {
      SENDGRID_API_KEY: key,
    };
    const mocks = getMocks();
    mocks.req.body.to_email = 'to@gmail.com';
    mocks.req.body.to_name = 'testA';
    mocks.req.body.from_name = 'testB';

    const sample = getSample();
    await sample.program.sendEmail(mocks.req, mocks.res);
    assert.strictEqual(mocks.res.status.callCount, 1);
    assert.deepStrictEqual(mocks.res.status.firstCall.args, [200]);
    assert.strictEqual(mocks.res.send.callCount, 1);
  });
});
