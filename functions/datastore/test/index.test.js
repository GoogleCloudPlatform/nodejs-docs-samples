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

const test = require(`ava`);
const Datastore = require(`@google-cloud/datastore`);
const datastore = Datastore();
const program = require(`../`);
const uuid = require(`uuid`);

const supertest = require(`supertest`);
const request = supertest(process.env.BASE_URL);

const NAME = `sampletask1`;
const KIND = `Task-${uuid.v4()}`;
const VALUE = {
  description: `Buy milk`
};

const errorMsg = msg => `${msg} not provided. Make sure you have a "${msg.toLowerCase()}" property in your request`;

test.serial(`set: Fails without a value`, (t) => {
  const req = {
    body: {}
  };
  t.throws(() => {
    program.set(req, null);
  }, errorMsg(`Value`));
});

test.serial(`set: Fails without a key`, (t) => {
  const req = {
    body: {
      value: VALUE
    }
  };
  t.throws(() => {
    program.set(req, null);
  }, errorMsg(`Key`));
});

test.serial(`set: Fails without a kind`, (t) => {
  const req = {
    body: {
      key: NAME,
      value: VALUE
    }
  };
  t.throws(() => {
    program.set(req, null);
  }, Error, errorMsg(`Kind`));
});

// TODO: @ace-n figure out why these tests started failing
test.skip.serial.cb(`set: Saves an entity`, (t) => {
  request
    .post(`/set`)
    .send({
      kind: KIND,
      key: NAME,
      value: VALUE
    })
    .expect(200)
    .expect((response) => {
      t.true(response.text.includes(`Entity ${KIND}/${NAME} saved`));
    })
    .end(t.end);
});

test.serial(`get: Fails without a key`, (t) => {
  const req = {
    body: {}
  };
  t.throws(() => {
    program.get(req, null);
  }, Error, errorMsg(`Key`));
});

test.serial(`get: Fails without a kind`, (t) => {
  const req = {
    body: {
      key: NAME
    }
  };
  t.throws(() => {
    program.get(req, null);
  }, Error, errorMsg(`Kind`));
});

test.serial.cb(`get: Fails when entity does not exist`, (t) => {
  request
    .post(`/get`)
    .send({
      kind: KIND,
      key: 'nonexistent'
    })
    .expect(500)
    .expect((response) => {
      t.regex(response.text, /(Missing or insufficient permissions.)|(No entity found for key)/);
    })
    .end(() => {
      setTimeout(t.end, 50); // Subsequent test is flaky without this timeout
    });
});

// TODO: ace-n Figure out why this test started failing, remove skip
test.skip.serial.cb(`get: Finds an entity`, (t) => {
  request
    .post(`/get`)
    .send({
      kind: KIND,
      key: NAME
    })
    .expect(200)
    .expect((response) => {
      t.deepEqual(
        JSON.parse(response.text),
        { description: 'Buy milk' }
      );
    })
    .end(t.end);
});

test.serial(`del: Fails without a key`, (t) => {
  const req = {
    body: {}
  };
  t.throws(() => {
    program.del(req, null);
  }, Error, errorMsg(`Kind`));
});

test.serial(`del: Fails without a kind`, (t) => {
  const req = {
    body: {
      key: NAME
    }
  };
  t.throws(() => {
    program.del(req, null);
  }, Error, errorMsg(`Kind`));
});

// TODO: ace-n Figure out why this test started failing
test.skip.serial.cb(`del: Doesn't fail when entity does not exist`, (t) => {
  request
    .post(`/del`)
    .send({
      kind: KIND,
      key: 'nonexistent'
    })
    .expect(200)
    .expect((response) => {
      t.is(response.text, `Entity ${KIND}/nonexistent deleted.`);
    })
    .end(t.end);
});

// TODO: ace-n Figure out why this test started failing
test.skip.serial(`del: Deletes an entity`, async (t) => {
  await new Promise(resolve => {
    request
      .post(`/del`)
      .send({
        kind: KIND,
        key: NAME
      })
      .expect(200)
      .expect((response) => {
        t.is(response.text, `Entity ${KIND}/${NAME} deleted.`);
      })
      .end(resolve);
  }).then(async () => {
    const key = datastore.key([KIND, NAME]);
    const [entity] = await datastore.get(key);
    t.falsy(entity);
  });
});
