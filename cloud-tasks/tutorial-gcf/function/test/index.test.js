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

describe('tasks/function', () => {
  const functionUrl = 'https://us-central1-proj.cloudfunctions.net/sendEmail';
  const serviceAccount = 'tasks@proj.iam.gserviceaccount.com';
  let key;
  let originalEnv;

  const getSample = function (verifyIdTokenStub) {
    const sendGridStub = {
      setApiKey: sinon.stub(),
      send: sinon.stub().resolves([{statusCode: 200}]),
    };
    const authClientStub = {
      verifyIdToken:
        verifyIdTokenStub ||
        sinon.stub().resolves({
          getPayload: () => ({email: serviceAccount, email_verified: true}),
        }),
    };

    return {
      program: proxyquire('../', {
        '@sendgrid/mail': sendGridStub,
        'google-auth-library': {
          OAuth2Client: sinon.stub().returns(authClientStub),
        },
      }),
      mocks: {
        sendGridStub: sendGridStub,
        authClientStub: authClientStub,
      },
    };
  };

  const getMocks = function () {
    const req = {
      headers: {authorization: 'Bearer valid-token'},
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
    key = 'SG.dummy_key_for_testing';
  });

  beforeEach(() => {
    originalEnv = {...process.env};
    process.env.SENDGRID_API_KEY = key;
    process.env.FUNCTION_URL = functionUrl;
    process.env.SERVICE_ACCOUNT_EMAIL = serviceAccount;
    process.env.ALLOWED_RECIPIENT_EMAILS = 'to@gmail.com';
    sinon.spy(console, 'error');
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    process.env = originalEnv;
    console.error.restore();
    console.log.restore();
  });

  it('send fails without API key', async () => {
    delete process.env.SENDGRID_API_KEY;
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
    const mocks = getMocks();
    mocks.req.body.to_email = 'to@gmail.com';
    mocks.req.body.from_name = 'testB';

    const sample = getSample();

    const error = new Error('Recipient name not provided.');
    error.code = 400;

    try {
      await sample.program.sendEmail(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
    }
  });

  it('send succeeds', async () => {
    const mocks = getMocks();
    mocks.req.body.to_email = 'to@gmail.com';
    mocks.req.body.to_name = 'testA';
    mocks.req.body.from_name = 'testB';

    const sample = getSample();
    await sample.program.sendEmail(mocks.req, mocks.res);
    assert.strictEqual(mocks.res.status.callCount, 1);
    assert.deepStrictEqual(mocks.res.status.firstCall.args, [200]);
    assert.strictEqual(mocks.res.send.callCount, 1);
    sinon.assert.calledOnceWithExactly(sample.mocks.sendGridStub.send, {
      to: 'to@gmail.com',
      from: 'postcard@example.com',
      subject: 'A Postcard Just for You!',
      html: sinon.match.string,
    });
  });

  it('rejects missing or invalid OIDC bearer token', async () => {
    const noAuth = getMocks();
    noAuth.req.headers = {};
    const sample = getSample(sinon.stub().rejects(new Error('invalid token')));

    await sample.program.sendEmail(noAuth.req, noAuth.res);
    assert.strictEqual(noAuth.res.statusCode, 401);

    const badAuth = getMocks();
    await sample.program.sendEmail(badAuth.req, badAuth.res);
    assert.strictEqual(badAuth.res.statusCode, 401);
    sinon.assert.notCalled(sample.mocks.sendGridStub.send);
  });

  it('rejects unexpected service account or disallowed recipient', async () => {
    const wrongSaMocks = getMocks();
    const wrongSaSample = getSample(
      sinon.stub().resolves({
        getPayload: () => ({
          email: 'other@proj.iam.gserviceaccount.com',
          email_verified: true,
        }),
      })
    );
    await wrongSaSample.program.sendEmail(wrongSaMocks.req, wrongSaMocks.res);
    assert.strictEqual(wrongSaMocks.res.statusCode, 403);

    const badRecipient = getMocks();
    badRecipient.req.body = {
      to_email: 'victim@external.example',
      to_name: 'testA',
      from_name: 'testB',
    };
    const sample = getSample();
    await sample.program.sendEmail(badRecipient.req, badRecipient.res);
    assert.strictEqual(badRecipient.res.statusCode, 403);

    const invalidEmail = getMocks();
    invalidEmail.req.body = {
      to_email: 'not-an-email',
      to_name: 'testA',
      from_name: 'testB',
    };
    await assert.rejects(
      () => sample.program.sendEmail(invalidEmail.req, invalidEmail.res),
      {message: 'Invalid email address.', code: 400}
    );
    sinon.assert.notCalled(sample.mocks.sendGridStub.send);
  });

  it('escapes HTML in to_name and from_name', async () => {
    const mocks = getMocks();
    mocks.req.body = {
      to_email: 'to@gmail.com',
      to_name: '<a href="https://evil.example">click</a>',
      from_name: '<img src="x" onerror="alert(1)">',
    };
    const sample = getSample();
    await sample.program.sendEmail(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.statusCode, 200);
    const {html} = sample.mocks.sendGridStub.send.firstCall.args[0];
    assert.ok(!html.includes('<a href='));
    assert.ok(!html.includes('<img '));
    assert.ok(
      html.includes(
        '&lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;'
      )
    );
  });

  it('returns generic 500 on SendGrid error', async () => {
    const mocks = getMocks();
    mocks.req.body = {
      to_email: 'to@gmail.com',
      to_name: 'testA',
      from_name: 'testB',
    };
    const sample = getSample();
    const err = new Error('SendGrid secret details');
    err.code = 403;
    sample.mocks.sendGridStub.send.rejects(err);

    await sample.program.sendEmail(mocks.req, mocks.res);
    assert.strictEqual(mocks.res.statusCode, 500);
    assert.strictEqual(
      mocks.res.send.firstCall.args[0],
      'Unable to send email.'
    );
  });
});
