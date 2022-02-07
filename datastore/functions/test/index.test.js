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
const execPromise = require('child-process-promise').exec;
const path = require('path');
const uuid = require('uuid');
const sinon = require('sinon');
const fetch = require('node-fetch');
const isReachable = require('is-reachable');
const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();
const program = require('../');

const FF_TIMEOUT = 3000;
const cwd = path.join(__dirname, '..');
const NAME = 'sampletask1';
const KIND = `Task-${uuid.v4()}`;
const VALUE = {
  description: 'Buy milk',
};

const errorMsg = msg =>
  `${msg} not provided. Make sure you have a "${msg.toLowerCase()}" property in your request`;

const handleLinuxFailures = async proc => {
  try {
    return await proc;
  } catch (err) {
    // Timeouts always cause errors on Linux, so catch them
    // Don't return proc, as await-ing it re-throws the error
    if (!err.name || err.name !== 'ChildProcessError') {
      throw err;
    }
  }
};

// Wait for the HTTP server to start listening
const waitForReady = async baseUrl => {
  let ready = false;
  while (!ready) {
    await new Promise(r => setTimeout(r, 500));
    ready = await isReachable(baseUrl);
  }
};

describe('functions/datastore', () => {
  describe('set', () => {
    let ffProc;
    const PORT = 8080;
    const BASE_URL = `http://localhost:${PORT}`;

    before(async () => {
      ffProc = execPromise(
        `functions-framework --target=set --signature-type=http --port=${PORT}`,
        {timeout: FF_TIMEOUT, shell: true, cwd}
      );
      await waitForReady(BASE_URL);
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    it('set: Fails without a value', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.set(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Value')));
    });

    it('set: Fails without a key', async () => {
      const req = {
        body: {
          value: VALUE,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      await program.set(req, res);
      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Key')));
    });

    it('set: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
          value: VALUE,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.set(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Kind')));
    });

    it('set: Saves an entity', async () => {
      const response = await fetch(`${BASE_URL}/set`, {
        method: 'POST',
        body: JSON.stringify({
          kind: KIND,
          key: NAME,
          value: VALUE,
        }),
        headers: {'Content-Type': 'application/json'},
      });
      assert.strictEqual(response.status, 200);
      const body = await response.text();
      assert.ok(body.includes(`Entity ${KIND}/${NAME} saved`));
    });
  });

  describe('get', () => {
    let ffProc;
    const PORT = 8081;
    const BASE_URL = `http://localhost:${PORT}`;

    before(async () => {
      ffProc = execPromise(
        `functions-framework --target=get --signature-type=http --port=${PORT}`,
        {timeout: FF_TIMEOUT, shell: true, cwd}
      );
      await waitForReady(BASE_URL);
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    it('get: Fails when entity does not exist', async () => {
      const response = await fetch(`${BASE_URL}/get`, {
        method: 'POST',
        body: JSON.stringify({
          kind: KIND,
          key: 'nonexistent',
        }),
        headers: {'Content-Type': 'application/json'},
        validateStatus: () => true,
      });

      assert.strictEqual(response.status, 500);
      const body = await response.text();
      assert.ok(
        new RegExp(
          /(Missing or insufficient permissions.)|(No entity found for key)/
        ).test(body)
      );
    });

    it('get: Finds an entity', async () => {
      const response = await fetch(`${BASE_URL}/get`, {
        method: 'POST',
        body: JSON.stringify({
          kind: KIND,
          key: NAME,
        }),
        headers: {'Content-Type': 'application/json'},
      });
      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.deepStrictEqual(body, {
        description: 'Buy milk',
      });
    });

    it('get: Fails without a key', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.get(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Key')));
    });

    it('get: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.get(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Kind')));
    });
  });

  describe('del', () => {
    let ffProc;
    const PORT = 8082;
    const BASE_URL = `http://localhost:${PORT}`;

    before(async () => {
      ffProc = execPromise(
        `functions-framework --target=del --signature-type=http --port=${PORT}`,
        {timeout: FF_TIMEOUT, shell: true, cwd}
      );
      await waitForReady(BASE_URL);
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    it('del: Fails without a key', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.del(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Key')));
    });

    it('del: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };

      await program.del(req, res);

      assert.ok(res.status.calledWith(500));
      assert.ok(res.send.calledWith(errorMsg('Kind')));
    });

    it("del: Doesn't fail when entity does not exist", async () => {
      const response = await fetch(`${BASE_URL}/del`, {
        method: 'POST',
        body: JSON.stringify({
          kind: KIND,
          key: 'nonexistent',
        }),
        headers: {'Content-Type': 'application/json'},
      });
      assert.strictEqual(response.status, 200);
      const body = await response.text();
      assert.strictEqual(body, `Entity ${KIND}/nonexistent deleted.`);
    });

    it('del: Deletes an entity', async () => {
      const response = await fetch(`${BASE_URL}/del`, {
        method: 'POST',
        body: JSON.stringify({
          kind: KIND,
          key: NAME,
        }),
        headers: {'Content-Type': 'application/json'},
      });
      assert.strictEqual(response.status, 200);
      const body = await response.text();
      assert.strictEqual(body, `Entity ${KIND}/${NAME} deleted.`);

      const key = datastore.key([KIND, NAME]);
      const [entity] = await datastore.get(key);
      assert.ok(!entity);
    });
  });
});
