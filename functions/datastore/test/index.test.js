/**
 * Copyright 2017, Google, Inc.
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

const assert = require('assert');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
const program = require('../');
const uuid = require('uuid');

const supertest = require('supertest');
const request = supertest(process.env.BASE_URL);

const NAME = 'sampletask1';
const KIND = `Task-${uuid.v4()}`;
const VALUE = {
  description: 'Buy milk',
};

const errorMsg = msg =>
  `${msg} not provided. Make sure you have a "${msg.toLowerCase()}" property in your request`;

it('set: Fails without a value', () => {
  const req = {
    body: {},
  };
  assert.throws(() => {
    program.set(req, null);
  }, errorMsg('Value!'));
});

it('set: Fails without a key', () => {
  const req = {
    body: {
      value: VALUE,
    },
  };
  assert.throws(() => {
    program.set(req, null);
  }, errorMsg('Key!'));
});

it('set: Fails without a kind', () => {
  const req = {
    body: {
      key: NAME,
      value: VALUE,
    },
  };
  assert.throws(
    () => {
      program.set(req, null);
    },
    Error,
    errorMsg('Kind')
  );
});

// TODO: @ace-n figure out why these tests started failing
it.skip('set: Saves an entity', async () => {
  await request
    .post('/set')
    .send({
      kind: KIND,
      key: NAME,
      value: VALUE,
    })
    .expect(200)
    .expect(response => {
      assert.strictEqual(
        response.text.includes(`Entity ${KIND}/${NAME} saved`),
        true
      );
    });
});

it('get: Fails without a key', () => {
  const req = {
    body: {},
  };
  assert.throws(
    () => {
      program.get(req, null);
    },
    Error,
    errorMsg('Key')
  );
});

it('get: Fails without a kind', () => {
  const req = {
    body: {
      key: NAME,
    },
  };
  assert.throws(
    () => {
      program.get(req, null);
    },
    Error,
    errorMsg('Kind')
  );
});

it('get: Fails when entity does not exist', async () => {
  await request
    .post('/get')
    .send({
      kind: KIND,
      key: 'nonexistent',
    })
    .expect(500)
    .expect(response => {
      assert.strictEqual(
        new RegExp(
          /(Missing or insufficient permissions.)|(No entity found for key)/
        ).test(response.text),
        true
      );
    });
});

// TODO: ace-n Figure out why this test started failing, remove skip
it.skip('get: Finds an entity', async () => {
  await request
    .post('/get')
    .send({
      kind: KIND,
      key: NAME,
    })
    .expect(200)
    .expect(response => {
      assert.deepStrictEqual(JSON.parse(response.text), {
        description: 'Buy milk',
      });
    });
});

it('del: Fails without a key', () => {
  const req = {
    body: {},
  };
  assert.throws(
    () => {
      program.del(req, null);
    },
    Error,
    errorMsg('Kind')
  );
});

it('del: Fails without a kind', () => {
  const req = {
    body: {
      key: NAME,
    },
  };
  assert.throws(
    () => {
      program.del(req, null);
    },
    Error,
    errorMsg('Kind')
  );
});

// TODO: ace-n Figure out why this test started failing
it.skip(`del: Doesn't fail when entity does not exist`, async () => {
  await request
    .post('/del')
    .send({
      kind: KIND,
      key: 'nonexistent',
    })
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, `Entity ${KIND}/nonexistent deleted.`);
    });
});

// TODO: ace-n Figure out why this test started failing
it.skip('del: Deletes an entity', async () => {
  await request
    .post(`/del`)
    .send({
      kind: KIND,
      key: NAME,
    })
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, `Entity ${KIND}/${NAME} deleted.`);
    });

  const key = datastore.key([KIND, NAME]);
  const [entity] = await datastore.get(key);
  assert.ok(!entity);
});
