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

var key = 'sengrid_key';
var to = 'receiver@email.com';
var from = 'sender@email.com';
var subject = 'subject';
var body = 'body';

function getSample () {
  var request = {};
  var client = {
    API: sinon.stub().callsArgWith(1, {
      statusCode: 200
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

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

test.beforeEach(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('Send fails without an API key', function (t) {
  var expectedMsg = 'SendGrid API key not provided. Make sure you have a ' +
    '"sg_key" property in your request';
  var context = getMockContext();

  getSample().sample.sendEmail(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('Send fails without a "to"', function (t) {
  var expectedMsg = 'To email address not provided. Make sure you have a ' +
    '"to" property in your request';
  var context = getMockContext();

  getSample().sample.sendEmail(context, {
    sg_key: key
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('Send fails without a "from"', function (t) {
  var expectedMsg = 'From email address not provided. Make sure you have a ' +
    '"from" property in your request';
  var context = getMockContext();

  getSample().sample.sendEmail(context, {
    sg_key: key,
    to: to
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('Send fails without a "subject"', function (t) {
  var expectedMsg = 'Email subject line not provided. Make sure you have a ' +
    '"subject" property in your request';
  var context = getMockContext();

  getSample().sample.sendEmail(context, {
    sg_key: key,
    to: to,
    from: from
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('Send fails without a "body"', function (t) {
  var expectedMsg = 'Email content not provided. Make sure you have a ' +
    '"body" property in your request';
  var context = getMockContext();

  getSample().sample.sendEmail(context, {
    sg_key: key,
    to: to,
    from: from,
    subject: subject
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('Sends the email and calls success', function (t) {
  var expectedMsg = 'Email sent!';
  var data = {
    sg_key: key,
    to: to,
    from: from,
    subject: subject,
    body: body
  };
  var payload = {
    method: 'POST',
    path: '/v3/mail/send',
    body: null
  };
  var context = getMockContext();

  var sendgridSample = getSample();
  sendgridSample.sample.sendEmail(context, data);

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedMsg);
  t.is(context.failure.called, false);
  t.is(sendgridSample.mocks.client.API.calledOnce, true);
  t.deepEqual(sendgridSample.mocks.client.API.firstCall.args[0], payload);
  t.is(console.error.called, false);
});

test('Fails to send the email and calls failure', function (t) {
  var expectedMsg = 'Failed to send email';
  var data = {
    sg_key: key,
    to: to,
    from: from,
    subject: subject,
    body: body
  };
  var payload = {
    method: 'POST',
    path: '/v3/mail/send',
    body: null
  };
  var context = getMockContext();

  var sendgridSample = getSample();
  sendgridSample.mocks.client.API = sinon.stub().callsArgWith(1, {
    statusCode: 400
  });

  sendgridSample.sample.sendEmail(context, data);

  t.is(context.success.called, false);
  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(sendgridSample.mocks.client.API.calledOnce, true);
  t.deepEqual(sendgridSample.mocks.client.API.firstCall.args[0], payload);
  t.is(console.error.called, true);
});

test.afterEach(function () {
  console.error.restore();
  console.log.restore();
});
