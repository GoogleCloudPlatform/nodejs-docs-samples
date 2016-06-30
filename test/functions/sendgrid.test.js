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

var proxyquire = require('proxyquire').noCallThru();
var util = require('util');
var EventEmitter = require('events');

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

describe('functions:pubsub', function () {
  it('Send fails if not a POST request', function () {
    var expectedMsg = 'Only POST requests are accepted';
    var mocks = getMocks();

    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 405);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Send fails without an API key', function () {
    var expectedMsg = 'SendGrid API key not provided. Make sure you have a ' +
      '"sg_key" property in your request querystring';
    var mocks = getMocks();

    mocks.req.method = method;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 401);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Send fails without a "to"', function () {
    var expectedMsg = 'To email address not provided. Make sure you have a ' +
      '"to" property in your request';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Send fails without a "from"', function () {
    var expectedMsg = 'From email address not provided. Make sure you have a ' +
      '"from" property in your request';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Send fails without a "subject"', function () {
    var expectedMsg = 'Email subject line not provided. Make sure you have a ' +
      '"subject" property in your request';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Send fails without a "body"', function () {
    var expectedMsg = 'Email content not provided. Make sure you have a ' +
      '"body" property in your request';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Sends the email and successfully responds', function () {
    var expectedMsg = 'success';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;
    mocks.req.body.body = body;
    getSample().sample.sendgridEmail(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
  });

  it('Handles response error', function () {
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

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 400);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
  });

  it('Handles thrown error', function () {
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

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 500);
    assert.equal(mocks.res.send.calledOnce, true);
  });

  it('Handles emtpy response body', function () {
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

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.calledOnce, false);
  });

  it('Send fails if not a POST request', function () {
    var expectedMsg = 'Only POST requests are accepted';
    var mocks = getMocks();

    getSample().sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 405);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Throws if no basic auth', function () {
    var expectedMsg = 'Invalid credentials';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = '';
    getSample().sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 401);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Throws if invalid username', function () {
    var expectedMsg = 'Invalid credentials';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = 'Basic d3Jvbmc6YmFy';
    getSample().sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 401);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Throws if invalid password', function () {
    var expectedMsg = 'Invalid credentials';
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = 'Basic Zm9vOndyb25n';
    getSample().sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 401);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
    assert(console.error.called);
  });

  it('Calls "end" if no events', function () {
    var mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = auth;
    mocks.req.body = undefined;
    getSample().sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.send.called, false);
    assert.equal(mocks.res.end.calledOnce, true);
  });

  it('Saves files', function () {
    var mocks = getMocks();

    mocks.req.method = 'POST';
    mocks.req.headers.authorization = auth;
    mocks.req.body = events;
    var sendgridSample = getSample();
    sendgridSample.mocks.uuid.v4 = sinon.stub().returns('1357');
    sendgridSample.sample.sendgridWebhook(mocks.req, mocks.res);

    var filename = sendgridSample.mocks.bucket.file.firstCall.args[0];
    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 200);
    assert.equal(mocks.res.end.calledOnce, true);
    assert.equal(console.log.calledWith('Saving events to ' + filename + ' in bucket ' + sendgridSample.mocks.config.EVENT_BUCKET), true);
    assert.equal(console.log.calledWith('JSON written to ' + filename), true);
  });

  it('Handles save error', function () {
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
    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 500);
    assert.equal(mocks.res.end.calledOnce, true);
    assert.equal(console.log.calledWith('Saving events to ' + filename + ' in bucket ' + sendgridSample.mocks.config.EVENT_BUCKET), true);
    assert.equal(console.error.calledWith(expectedMsg), true);
  });

  it('Handles random error', function () {
    var expectedMsg = 'random_error';
    var mocks = getMocks();

    mocks.req.method = 'POST';
    mocks.req.headers.authorization = auth;
    mocks.req.body = events;
    var sendgridSample = getSample();
    sendgridSample.mocks.uuid.v4 = sinon.stub().throws(new Error(expectedMsg));
    sendgridSample.sample.sendgridWebhook(mocks.req, mocks.res);

    assert.equal(mocks.res.status.calledOnce, true);
    assert.equal(mocks.res.status.firstCall.args[0], 500);
    assert.equal(mocks.res.send.calledOnce, true);
    assert.equal(mocks.res.send.firstCall.args[0], expectedMsg);
  });

  it('sendgridLoad does nothing on delete', function () {
    var context = getMockContext();

    getSample().sample.sendgridLoad(context, {
      timeDeleted: 1234
    });

    assert.equal(context.done.calledOnce, true);
    assert.equal(context.failure.called, false);
    assert.equal(context.success.called, false);
  });

  it('sendgridLoad fails without a bucket', function () {
    var expectedMsg = 'Bucket not provided. Make sure you have a ' +
      '"bucket" property in your request';
    var context = getMockContext();

    getSample().sample.sendgridLoad(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert(console.error.called);
  });

  it('sendgridLoad fails without a name', function () {
    var expectedMsg = 'Filename not provided. Make sure you have a ' +
      '"name" property in your request';
    var context = getMockContext();

    getSample().sample.sendgridLoad(context, {
      bucket: 'event-bucket'
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert(console.error.called);
  });

  it('starts a load job', function (done) {
    var name = '1234.json';
    var context = {
      success: function () {
        assert.equal(console.log.calledWith('Starting job for ' + name), true);
        assert.equal(console.log.calledWith('Job complete for ' + name), true);
        done();
      },
      failure: assert.fail
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

  it('handles job failure', function (done) {
    var name = '1234.json';
    var error = 'job_error';
    var context = {
      success: assert.fail,
      failure: function (msg) {
        assert.equal(msg, error);
        assert.equal(console.log.calledWith('Starting job for ' + name), true);
        assert.equal(console.error.calledWith('Job failed for ' + name), true);
        assert.equal(console.error.calledWith(error), true);
        done();
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

  it('handles dataset error', function (done) {
    var name = '1234.json';
    var error = 'dataset_error';
    var context = {
      success: assert.fail,
      failure: function (msg) {
        assert.equal(msg, error);
        assert.equal(console.error.calledWith(error), true);
        done();
      }
    };

    var sendgridSample = getSample();
    sendgridSample.mocks.dataset.get = sinon.stub().callsArgWith(1, error);
    sendgridSample.sample.sendgridLoad(context, {
      bucket: 'event-bucket',
      name: name
    });
  });

  it('handles table error', function (done) {
    var name = '1234.json';
    var error = 'table_error';
    var context = {
      success: assert.fail,
      failure: function (msg) {
        assert.equal(msg, error);
        assert.equal(console.error.calledWith(error), true);
        done();
      }
    };

    var sendgridSample = getSample();
    sendgridSample.mocks.table.get = sinon.stub().callsArgWith(1, error);
    sendgridSample.sample.sendgridLoad(context, {
      bucket: 'event-bucket',
      name: name
    });
  });
});
