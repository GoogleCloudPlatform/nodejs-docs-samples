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

const proxyquire = require(`proxyquire`).noCallThru();

const method = `POST`;
const key = `sengrid_key`;
const to = `receiver@email.com`;
const from = `sender@email.com`;
const subject = `subject`;
const body = `body`;
const auth = `Basic Zm9vOmJhcg==`;
const events = [
  {
    sg_message_id: `sendgrid_internal_message_id`,
    email: `john.doe@sendgrid.com`,
    timestamp: 1337197600,
    'smtp-id': `<4FB4041F.6080505@sendgrid.com>`,
    event: `processed`
  },
  {
    sg_message_id: `sendgrid_internal_message_id`,
    email: `john.doe@sendgrid.com`,
    timestamp: 1337966815,
    category: `newuser`,
    event: `click`,
    url: `https://sendgrid.com`
  },
  {
    sg_message_id: `sendgrid_internal_message_id`,
    email: `john.doe@sendgrid.com`,
    timestamp: 1337969592,
    'smtp-id': `<20120525181309.C1A9B40405B3@Example-Mac.local>`,
    event: `group_unsubscribe`,
    asm_group_id: 42
  }
];

function getSample () {
  const config = {
    EVENT_BUCKET: 'event-bucket',
    DATASET: 'datasets',
    TABLE: 'events',
    USERNAME: 'foo',
    PASSWORD: 'bar'
  };
  const request = {};
  const client = {
    API: sinon.stub().returns(Promise.resolve({
      statusCode: 200,
      body: 'success',
      headers: {
        'content-type': 'application/json',
        'content-length': 10
      }
    })),
    emptyRequest: sinon.stub().returns(request)
  };
  const file = { save: sinon.stub().returns(Promise.resolve()) };
  const bucket = { file: sinon.stub().returns(file) };
  const storage = { bucket: sinon.stub().returns(bucket) };
  const job = { promise: sinon.stub().returns(Promise.resolve()) };
  const table = { import: sinon.stub().returns(Promise.resolve([job, {}])) };
  table.get = sinon.stub().returns(Promise.resolve([table]));
  const dataset = { table: sinon.stub().returns(table) };
  dataset.get = sinon.stub().returns(Promise.resolve([dataset]));
  const bigquery = { dataset: sinon.stub().returns(dataset) };
  const BigQueryMock = sinon.stub().returns(bigquery);
  const StorageMock = sinon.stub().returns(storage);
  const sendgrid = sinon.stub().returns(client);
  const uuid = { v4: sinon.stub() };

  return {
    program: proxyquire(`../`, {
      sendgrid: sendgrid,
      '@google-cloud/bigquery': BigQueryMock,
      '@google-cloud/storage': StorageMock,
      './config.json': config,
      'node-uuid': uuid
    }),
    mocks: {
      sendgrid,
      client,
      request,
      bucket,
      file,
      storage,
      bigquery,
      dataset,
      table,
      config,
      uuid,
      job
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

describe(`functions:sendgrid`, () => {
  it(`Send fails if not a POST request`, () => {
    const error = new Error(`Only POST requests are accepted`);
    error.code = 405;
    const sample = getSample();
    const mocks = getMocks();

    return sample.program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Send fails without an API key`, () => {
    const error = new Error(`SendGrid API key not provided. Make sure you have a "sg_key" property in your request querystring`);
    error.code = 401;
    const mocks = getMocks();

    mocks.req.method = method;

    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Send fails without a "to"`, () => {
    const error = new Error(`To email address not provided. Make sure you have a "to" property in your request`);
    error.code = 400;
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Send fails without a "from"`, () => {
    const error = new Error(`From email address not provided. Make sure you have a "from" property in your request`);
    error.code = 400;
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;

    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Send fails without a "subject"`, () => {
    const error = new Error(`Email subject line not provided. Make sure you have a "subject" property in your request`);
    error.code = 400;
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;

    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Send fails without a "body"`, () => {
    const error = new Error(`Email body not provided. Make sure you have a "body" property in your request`);
    error.code = 400;
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;

    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [error.code]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Handles response error`, () => {
    const mocks = getMocks();
    const sample = getSample();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;
    mocks.req.body.body = body;
    sample.mocks.client.API.returns(Promise.resolve({
      statusCode: 500,
      body: `error`
    }));

    return sample.program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [500]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args[0].message, `error`);
      });
  });

  it(`Sends the email and successfully responds`, () => {
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;
    mocks.req.body.body = body;

    return getSample().program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [200]);
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [`success`]);
      });
  });

  it(`Handles empty response body`, () => {
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.query.sg_key = key;
    mocks.req.body.to = to;
    mocks.req.body.from = from;
    mocks.req.body.subject = subject;
    mocks.req.body.body = body;

    sample.mocks.client.API.returns(Promise.resolve({
      statusCode: 200,
      headers: {}
    }));

    return sample.program.sendgridEmail(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [200]);
        assert.equal(mocks.res.end.callCount, 1);
        assert.deepEqual(mocks.res.end.firstCall.args, []);
      });
  });

  it(`Send fails if not a POST request`, () => {
    const error = new Error(`Only POST requests are accepted`);
    error.code = 405;
    const sample = getSample();
    const mocks = getMocks();

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Throws if no basic auth`, () => {
    const error = new Error(`Invalid credentials`);
    error.code = 401;
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = ``;

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Throws if invalid username`, () => {
    const error = new Error(`Invalid credentials`);
    error.code = 401;
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = `Basic d3Jvbmc6YmFy`;

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Throws if invalid password`, () => {
    const error = new Error(`Invalid credentials`);
    error.code = 401;
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = `Basic Zm9vOndyb25n`;

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.send.callCount, 1);
        assert.deepEqual(mocks.res.send.firstCall.args, [error]);
        assert.equal(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
      });
  });

  it(`Calls "end" if no events`, () => {
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = method;
    mocks.req.headers.authorization = auth;
    mocks.req.body = undefined;

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        assert.equal(mocks.res.end.callCount, 1);
        assert.deepEqual(mocks.res.end.firstCall.args, []);
      });
  });

  it(`Saves files`, () => {
    const sample = getSample();
    const mocks = getMocks();

    mocks.req.method = `POST`;
    mocks.req.headers.authorization = auth;
    mocks.req.body = events;
    sample.mocks.uuid.v4 = sinon.stub().returns(`1357`);

    return sample.program.sendgridWebhook(mocks.req, mocks.res)
      .then(() => {
        const filename = sample.mocks.bucket.file.firstCall.args[0];
        assert.equal(mocks.res.status.callCount, 1);
        assert.deepEqual(mocks.res.status.firstCall.args, [200]);
        assert.equal(mocks.res.end.callCount, 1);
        assert.deepEqual(console.log.getCall(0).args, [`Saving events to ${filename} in bucket ${sample.mocks.config.EVENT_BUCKET}`]);
        assert.deepEqual(console.log.getCall(1).args, [`JSON written to ${filename}`]);
      });
  });

  it(`sendgridLoad does nothing on delete`, () => {
    return getSample().program.sendgridLoad({
      data: {
        resourceState: `not_exists`
      }
    });
  });

  it(`sendgridLoad fails without a bucket`, () => {
    const error = new Error(`Bucket not provided. Make sure you have a "bucket" property in your request`);
    const event = {
      data: {}
    };

    return getSample().program.sendgridLoad(event)
      .then(() => assert.fail(`Should have failed!`))
      .catch((err) => assert.deepEqual(err, error));
  });

  it(`sendgridLoad fails without a name`, () => {
    const error = new Error(`Filename not provided. Make sure you have a "name" property in your request`);
    const event = {
      data: {
        bucket: `event-bucket`
      }
    };

    return getSample().program.sendgridLoad(event)
      .then(() => assert.fail(`Should have failed!`))
      .catch((err) => assert.deepEqual(err, error));
  });

  it(`starts a load job`, () => {
    const sample = getSample();
    const name = `1234.json`;
    const event = {
      data: {
        bucket: `event-bucket`,
        name: name
      }
    };

    return sample.program.sendgridLoad(event)
      .then(() => {
        assert.deepEqual(console.log.getCall(0).args, [`Starting job for ${name}`]);
        assert.deepEqual(console.log.getCall(1).args, [`Job complete for ${name}`]);
      });
  });
});
