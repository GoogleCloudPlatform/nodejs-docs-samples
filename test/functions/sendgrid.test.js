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

var method = 'POST';
var key = 'sengrid_key';
var to = 'receiver@email.com';
var from = 'sender@email.com';
var subject = 'subject';
var body = 'body';

function getSample () {
  var request = {};
  var client = {
    API: sinon.stub().callsArgWith(1, {
      statusCode: 200,
      body: 'success',
      headers: {
        'content-type': 'application/json',
        'content-length': 10
      }
    }),
    emptyRequest: sinon.stub().returns(request)
  };
  var mail = {
    toJSON: sinon.stub()
  };
  var sendgrid = {
    SendGrid: sinon.stub().returns(client),
    mail: {
      Mail: sinon.stub().returns(mail),
      Email: sinon.stub(),
      Content: sinon.stub()
    }
  };
  return {
    sample: proxyquire('../../functions/sendgrid', {
      sendgrid: sendgrid
    }),
    mocks: {
      sendgrid: sendgrid,
      client: client,
      mail: mail,
      request: request
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

test.before(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('Send fails if not a POST request', function (t) {
  var expectedMsg = 'Only POST requests are accepted';
  var mocks = getMocks();

  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 405);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Send fails without an API key', function (t) {
  var expectedMsg = 'SendGrid API key not provided. Make sure you have a ' +
    '"sg_key" property in your request querystring';
  var mocks = getMocks();

  mocks.req.method = method;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 401);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Send fails without a "to"', function (t) {
  var expectedMsg = 'To email address not provided. Make sure you have a ' +
    '"to" property in your request';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Send fails without a "from"', function (t) {
  var expectedMsg = 'From email address not provided. Make sure you have a ' +
    '"from" property in your request';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Send fails without a "subject"', function (t) {
  var expectedMsg = 'Email subject line not provided. Make sure you have a ' +
    '"subject" property in your request';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Send fails without a "body"', function (t) {
  var expectedMsg = 'Email content not provided. Make sure you have a ' +
    '"body" property in your request';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  mocks.req.body.subject = subject;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Sends the email and successfully responds', function (t) {
  var expectedMsg = 'success';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  mocks.req.body.subject = subject;
  mocks.req.body.body = body;
  getSample().sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
});

test('Handles response error', function (t) {
  var expectedMsg = 'failure';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  mocks.req.body.subject = subject;
  mocks.req.body.body = body;

  var sendgridSample = getSample();
  sendgridSample.mocks.client.API = sinon.stub().callsArgWith(1, {
    statusCode: 400,
    body: 'failure',
    headers: {}
  });
  sendgridSample.sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 400);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
});

test('Handles thrown error', function (t) {
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  mocks.req.body.subject = subject;
  mocks.req.body.body = body;

  var sendgridSample = getSample();
  sendgridSample.mocks.mail.toJSON = sinon.stub().throws('TypeError');
  sendgridSample.sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 500);
  t.is(mocks.res.send.calledOnce, true);
});

test('Handles emtpy response body', function (t) {
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.query.sg_key = key;
  mocks.req.body.to = to;
  mocks.req.body.from = from;
  mocks.req.body.subject = subject;
  mocks.req.body.body = body;

  var sendgridSample = getSample();
  sendgridSample.mocks.client.API = sinon.stub().callsArgWith(1, {
    statusCode: 200,
    headers: {}
  });
  sendgridSample.sample.sendgridEmail(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.calledOnce, false);
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
