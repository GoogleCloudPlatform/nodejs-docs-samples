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
const util = require('util');
const EventEmitter = require('events');

var method = 'POST';
var key = 'sengrid_key';
var to = 'receiver@email.com';
var from = 'sender@email.com';
var subject = 'subject';
var body = 'body';
var auth = 'Basic Zm9vOmJhcg==';
var events = [
  {
    sg_message_id: 'sendgrid_internal_message_id',
    email: 'john.doe@sendgrid.com',
    timestamp: 1337197600,
    'smtp-id': '<4FB4041F.6080505@sendgrid.com>',
    event: 'processed'
  },
  {
    sg_message_id: 'sendgrid_internal_message_id',
    email: 'john.doe@sendgrid.com',
    timestamp: 1337966815,
    category: 'newuser',
    event: 'click',
    url: 'https://sendgrid.com'
  },
  {
    sg_message_id: 'sendgrid_internal_message_id',
    email: 'john.doe@sendgrid.com',
    timestamp: 1337969592,
    'smtp-id': '<20120525181309.C1A9B40405B3@Example-Mac.local>',
    event: 'group_unsubscribe',
    asm_group_id: 42
  }
];

function getSample () {
  var config = {
    EVENT_BUCKET: 'event-bucket',
    DATASET: 'datasets',
    TABLE: 'events',
    USERNAME: 'foo',
    PASSWORD: 'bar'
  };
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
  var file = {
    save: sinon.stub().callsArg(1)
  };
  var bucket = {
    file: sinon.stub().returns(file)
  };
  var storage = {
    bucket: sinon.stub().returns(bucket)
  };
  function Job () {}
  util.inherits(Job, EventEmitter);
  var job = new Job();
  var table = {};
  table.get = sinon.stub().callsArgWith(1, null, table);
  table.import = sinon.stub().callsArgWith(2, null, job, {});
  var dataset = {
    table: sinon.stub().returns(table)
  };
  dataset.get = sinon.stub().callsArgWith(1, null, dataset);
  var bigquery = {
    dataset: sinon.stub().returns(dataset)
  };
  var gcloud = {
    bigquery: sinon.stub().returns(bigquery),
    storage: sinon.stub().returns(storage)
  };
  var sendgrid = {
    SendGrid: sinon.stub().returns(client),
    mail: {
      Mail: sinon.stub().returns(mail),
      Email: sinon.stub(),
      Content: sinon.stub()
    }
  };
  var uuid = {
    v4: sinon.stub()
  };
  return {
    sample: proxyquire('../../functions/sendgrid', {
      sendgrid: sendgrid,
      gcloud: gcloud,
      './config.json': config,
      'node-uuid': uuid
    }),
    mocks: {
      sendgrid: sendgrid,
      client: client,
      mail: mail,
      request: request,
      bucket: bucket,
      file: file,
      storage: storage,
      bigquery: bigquery,
      dataset: dataset,
      table: table,
      config: config,
      uuid: uuid,
      job: job
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

function getMockContext () {
  return {
    done: sinon.stub(),
    success: sinon.stub(),
    failure: sinon.stub()
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

test('Send fails if not a POST request', function (t) {
  var expectedMsg = 'Only POST requests are accepted';
  var mocks = getMocks();

  getSample().sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 405);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Throws if no basic auth', function (t) {
  var expectedMsg = 'Invalid credentials';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.headers.authorization = '';
  getSample().sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 401);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Throws if invalid username', function (t) {
  var expectedMsg = 'Invalid credentials';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.headers.authorization = 'Basic d3Jvbmc6YmFy';
  getSample().sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 401);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Throws if invalid password', function (t) {
  var expectedMsg = 'Invalid credentials';
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.headers.authorization = 'Basic Zm9vOndyb25n';
  getSample().sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 401);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
  t.is(console.error.called, true);
});

test('Calls "end" if no events', function (t) {
  var mocks = getMocks();

  mocks.req.method = method;
  mocks.req.headers.authorization = auth;
  mocks.req.body = undefined;
  getSample().sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.send.called, false);
  t.is(mocks.res.end.calledOnce, true);
  t.is(console.error.called, true);
});

test('Saves files', function (t) {
  var mocks = getMocks();

  mocks.req.method = 'POST';
  mocks.req.headers.authorization = auth;
  mocks.req.body = events;
  var sendgridSample = getSample();
  sendgridSample.mocks.uuid.v4 = sinon.stub().returns('1357');
  sendgridSample.sample.sendgridWebhook(mocks.req, mocks.res);

  var filename = sendgridSample.mocks.bucket.file.firstCall.args[0];
  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 200);
  t.is(mocks.res.end.calledOnce, true);
  t.is(console.log.calledWith('Saving events to ' + filename + ' in bucket ' + sendgridSample.mocks.config.EVENT_BUCKET), true);
  t.is(console.log.calledWith('JSON written to ' + filename), true);
});

test('Handles save error', function (t) {
  var expectedMsg = 'save_error';
  var mocks = getMocks();

  mocks.req.method = 'POST';
  mocks.req.headers.authorization = auth;
  mocks.req.body = events;
  var sendgridSample = getSample();
  sendgridSample.mocks.uuid.v4 = sinon.stub().returns('2468');
  sendgridSample.mocks.file.save = sinon.stub().callsArgWith(1, expectedMsg);
  sendgridSample.sample.sendgridWebhook(mocks.req, mocks.res);

  var filename = sendgridSample.mocks.bucket.file.firstCall.args[0];
  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 500);
  t.is(mocks.res.end.calledOnce, true);
  t.is(console.log.calledWith('Saving events to ' + filename + ' in bucket ' + sendgridSample.mocks.config.EVENT_BUCKET), true);
  t.is(console.error.calledWith(expectedMsg), true);
});

test('Handles random error', function (t) {
  var expectedMsg = 'random_error';
  var mocks = getMocks();

  mocks.req.method = 'POST';
  mocks.req.headers.authorization = auth;
  mocks.req.body = events;
  var sendgridSample = getSample();
  sendgridSample.mocks.uuid.v4 = sinon.stub().throws(new Error(expectedMsg));
  sendgridSample.sample.sendgridWebhook(mocks.req, mocks.res);

  t.is(mocks.res.status.calledOnce, true);
  t.is(mocks.res.status.firstCall.args[0], 500);
  t.is(mocks.res.send.calledOnce, true);
  t.is(mocks.res.send.firstCall.args[0], expectedMsg);
});

test('sendgridLoad does nothing on delete', function (t) {
  var context = getMockContext();

  getSample().sample.sendgridLoad(context, {
    timeDeleted: 1234
  });

  t.is(context.done.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(context.success.called, false);
});

test('sendgridLoad fails without a bucket', function (t) {
  var expectedMsg = 'Bucket not provided. Make sure you have a ' +
    '"bucket" property in your request';
  var context = getMockContext();

  getSample().sample.sendgridLoad(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test('sendgridLoad fails without a name', function (t) {
  var expectedMsg = 'Filename not provided. Make sure you have a ' +
    '"name" property in your request';
  var context = getMockContext();

  getSample().sample.sendgridLoad(context, {
    bucket: 'event-bucket'
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(console.error.called, true);
});

test.cb.serial('starts a load job', function (t) {
  var name = '1234.json';
  var context = {
    success: function () {
      t.is(console.log.calledWith('Starting job for ' + name), true);
      t.is(console.log.calledWith('Job complete for ' + name), true);
      t.end();
    },
    failure: t.fail
  };

  var sendgridSample = getSample();
  sendgridSample.sample.sendgridLoad(context, {
    bucket: 'event-bucket',
    name: name
  });

  setTimeout(function () {
    sendgridSample.mocks.job.emit('complete', {});
  }, 10);
});

test.cb.serial('handles job failure', function (t) {
  var name = '1234.json';
  var error = 'job_error';
  var context = {
    success: t.fail,
    failure: function (msg) {
      t.is(msg, error);
      t.is(console.log.calledWith('Starting job for ' + name), true);
      t.is(console.error.calledWith('Job failed for ' + name), true);
      t.is(console.error.calledWith(error), true);
      t.end();
    }
  };

  var sendgridSample = getSample();
  sendgridSample.sample.sendgridLoad(context, {
    bucket: 'event-bucket',
    name: name
  });

  setTimeout(function () {
    sendgridSample.mocks.job.emit('error', error);
  }, 10);
});

test.cb.serial('handles dataset error', function (t) {
  var name = '1234.json';
  var error = 'dataset_error';
  var context = {
    success: t.fail,
    failure: function (msg) {
      t.is(msg, error);
      t.is(console.error.calledWith(error), true);
      t.end();
    }
  };

  var sendgridSample = getSample();
  sendgridSample.mocks.dataset.get = sinon.stub().callsArgWith(1, error);
  sendgridSample.sample.sendgridLoad(context, {
    bucket: 'event-bucket',
    name: name
  });
});

test.cb.serial('handles table error', function (t) {
  var name = '1234.json';
  var error = 'table_error';
  var context = {
    success: t.fail,
    failure: function (msg) {
      t.is(msg, error);
      t.is(console.error.calledWith(error), true);
      t.end();
    }
  };

  var sendgridSample = getSample();
  sendgridSample.mocks.table.get = sinon.stub().callsArgWith(1, error);
  sendgridSample.sample.sendgridLoad(context, {
    bucket: 'event-bucket',
    name: name
  });
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
