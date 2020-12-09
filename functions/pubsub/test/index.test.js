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
const path = require('path');
const sinon = require('sinon');

const execPromise = require('child-process-promise').exec;
const requestRetry = require('requestretry');

const PORT = 9020;
const BASE_URL = `http://localhost:${PORT}`;
const cwd = path.join(__dirname, '..');

const TOPIC = process.env.FUNCTIONS_TOPIC;
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

  before(() => {
    // exec's 'timeout' param won't kill children of "shim" /bin/sh process
    // Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    ffProc = execPromise(
      `functions-framework --target=publish --signature-type=http --port=${PORT} & sleep 1; kill $!`,
      {shell: true, cwd}
    );
  });

  after(async () => {
    await ffProc;
  });

  describe('functions_pubsub_publish', () => {
    it('publish fails without parameters', async () => {
      const response = await requestRetry({
        url: `${BASE_URL}/`,
        method: 'POST',
        body: {},
        retryDelay: 200,
        json: true,
      });

      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(
        response.body,
        'Missing parameter(s); include "topic" and "message" properties in your request.'
      );
    });

    it('publishes a message', async () => {
      const response = await requestRetry({
        url: `${BASE_URL}/`,
        method: 'POST',
        body: {
          topic: TOPIC,
          message: 'Pub/Sub from Cloud Functions',
        },
        retryDelay: 200,
        json: true,
      });

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, 'Message published.');
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
