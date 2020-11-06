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

const path = require('path');
const assert = require('assert');
const requestRetry = require('requestretry');
const sinon = require('sinon');
const execPromise = require('child-process-promise').exec;

const program = require('..');

const startFF = (target, signature, port) => {
  const cwd = path.join(__dirname, '..');
  // exec's 'timeout' param won't kill children of "shim" /bin/sh process
  // Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
  return execPromise(
    `functions-framework --target=${target} --signature-type=${signature} --port=${port} & sleep 1; kill $!`,
    {shell: true, cwd}
  );
};

const httpInvocation = (fnUrl, port, body) => {
  const baseUrl = `http://localhost:${port}`;

  if (body) {
    // POST request
    return requestRetry.post({
      url: `${baseUrl}/${fnUrl}`,
      retryDelay: 400,
      body: body,
      json: true,
    });
  } else {
    // GET request
    return requestRetry.get({
      url: `${baseUrl}/${fnUrl}`,
      retryDelay: 400,
    });
  }
};

describe('index.test.js', () => {
  before(() => {
    assert(
      process.env.GOOGLE_CLOUD_PROJECT,
      'Must set GOOGLE_CLOUD_PROJECT environment variable!'
    );
    assert(
      process.env.GOOGLE_APPLICATION_CREDENTIALS,
      'Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!'
    );
  });

  describe('functions_helloworld_get helloGET', () => {
    const PORT = 8081;
    let ffProc;

    before(() => {
      ffProc = startFF('helloGET', 'http', PORT);
    });

    after(async () => {
      await ffProc;
    });

    it('helloGET: should print hello world', async () => {
      const response = await httpInvocation('helloGET', PORT);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, 'Hello World!');
    });
  });

  describe('functions_helloworld_http helloHttp', () => {
    const PORT = 8082;
    let ffProc;

    before(() => {
      ffProc = startFF('helloHttp', 'http', PORT);
    });

    after(async () => {
      await ffProc;
    });

    it('helloHttp: should print a name via GET', async () => {
      const response = await httpInvocation('helloHttp?name=John', PORT);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, 'Hello John!');
    });

    it('helloHttp: should print a name via POST', async () => {
      const response = await httpInvocation('helloHttp', PORT, {name: 'John'});

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, 'Hello John!');
    });

    it('helloHttp: should print hello world', async () => {
      const response = await httpInvocation('helloHttp', PORT);

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body, 'Hello World!');
    });

    it('helloHttp: should escape XSS', async () => {
      const response = await httpInvocation('helloHttp', PORT, {
        name: '<script>alert(1)</script>',
      });

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.includes('<script>'), false);
    });
  });

  describe('functions_helloworld_pubsub helloPubSub', () => {
    /* See sample.integration.pubsub.test.js */
  });

  describe('functions_helloworld_storage helloGCS', () => {
    /* See sample.integration.storage.test.js */
  });

  describe('functions_helloworld_error', () => {
    describe('Error handling (unit tests)', () => {
      it('helloError: should throw an error', () => {
        assert.throws(program.helloError, 'Error: I failed you');
      });

      it('helloError2: should throw a value', () => {
        assert.throws(program.helloError2, '1');
      });

      it('helloError3: callback should return an errback value', () => {
        const cb = sinon.stub();

        program.helloError3(null, null, cb);

        assert.ok(cb.calledOnce);
        assert.ok(cb.calledWith('I failed you'));
      });
    });
  });
});
