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

import {ok, strictEqual, deepStrictEqual} from 'assert';
import {exec as execPromise} from 'child-process-promise';
import {join} from 'path';
import {v4} from 'uuid';
import {stub} from 'sinon';
import fetch from 'node-fetch';
import waitPort from 'wait-port';
import {Datastore} from '@google-cloud/datastore';

const datastore = new Datastore();
import {set, get, del} from '../';

const FF_TIMEOUT = 3000;
const cwd = join(__dirname, '..');
const NAME = 'sampletask1';
const KIND = `Task-${v4()}`;
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
      await waitPort({port: PORT});
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    it('set: Fails without a value', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await set(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Value')));
    });

    it('set: Fails without a key', async () => {
      const req = {
        body: {
          value: VALUE,
        },
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };
      await set(req, res);
      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Key')));
    });

    it('set: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
          value: VALUE,
        },
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await set(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Kind')));
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
      strictEqual(response.status, 200);
      const body = await response.text();
      ok(body.includes(`Entity ${KIND}/${NAME} saved`));
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
      await waitPort({port: PORT});
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

      strictEqual(response.status, 500);
      const body = await response.text();
      ok(
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
      strictEqual(response.status, 200);
      const body = await response.json();
      deepStrictEqual(body, {
        description: 'Buy milk',
      });
    });

    it('get: Fails without a key', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await get(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Key')));
    });

    it('get: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
        },
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await get(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Kind')));
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
      await waitPort({port: PORT});
    });

    after(async () => {
      await handleLinuxFailures(ffProc);
    });

    it('del: Fails without a key', async () => {
      const req = {
        body: {},
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await del(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Key')));
    });

    it('del: Fails without a kind', async () => {
      const req = {
        body: {
          key: NAME,
        },
      };
      const res = {
        status: stub().returnsThis(),
        send: stub(),
      };

      await del(req, res);

      ok(res.status.calledWith(500));
      ok(res.send.calledWith(errorMsg('Kind')));
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
      strictEqual(response.status, 200);
      const body = await response.text();
      strictEqual(body, `Entity ${KIND}/nonexistent deleted.`);
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
      strictEqual(response.status, 200);
      const body = await response.text();
      strictEqual(body, `Entity ${KIND}/${NAME} deleted.`);

      const key = datastore.key([KIND, NAME]);
      const [entity] = await datastore.get(key);
      ok(!entity);
    });
  });
});
