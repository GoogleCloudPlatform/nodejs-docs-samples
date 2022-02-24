// Copyright 2017 Google LLC
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

const assert = require('assert');
const sinon = require('sinon');
const {spawn} = require('child_process');
const waitPort = require('wait-port');
const {request} = require('gaxios');

const PORT = 9020;
const BASE_URL = `http://localhost:${PORT}`;

const TOPIC = 'integration-tests-instance';
const MESSAGE = 'Hello, world!';

describe('functions/pubsub', () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  //Restore console
  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };
  beforeEach(stubConsole);
  afterEach(restoreConsole);

  let ffProc;

  before(async () => {
    ffProc = spawn('npx', [
      'functions-framework',
      '--target',
      'publish',
      '--signature-type',
      'http',
      '--port',
      PORT,
    ]);
    await waitPort({host: 'localhost', port: PORT});
  });

  after(() => ffProc.kill());

  describe('functions_pubsub_publish', () => {
    it('publish fails without parameters', async () => {
      const response = await request({
        url: `${BASE_URL}/`,
        method: 'POST',
        data: {},
        validateStatus: () => true,
      });

      assert.strictEqual(response.status, 400);
      assert.strictEqual(
        response.data,
        'Missing parameter(s); include "topic" and "message" properties in your request.'
      );
    });

    it('publishes a message', async () => {
      const response = await request({
        url: `${BASE_URL}/`,
        method: 'POST',
        data: {
          topic: TOPIC,
          message: 'Pub/Sub from Cloud Functions',
        },
      });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data, 'Message published.');
    });
  });

  describe('functions_pubsub_subscribe', () => {
    it('prints out a message', () => {
      const jsonObject = JSON.stringify({data: MESSAGE});
      const jsonBuffer = Buffer.from(jsonObject).toString('base64');
      const pubsubMessage = {data: jsonBuffer, attributes: {}};

      require('..').subscribe(pubsubMessage);

      assert.strictEqual(console.log.callCount, 1);
      assert.deepStrictEqual(console.log.firstCall.args, [jsonObject]);
    });
  });
});
