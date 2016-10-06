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

const NAME = `sampletask1`;
const KIND = `Task`;
const VALUE = {
  description: `Buy milk`
};

function getSample () {
  const key = {
    kind: KIND,
    name: NAME,
    path: [KIND, NAME]
  };
  const entity = {
    key: key,
    data: VALUE
  };
  const datastore = {
    delete: sinon.stub().returns(Promise.resolve()),
    get: sinon.stub().returns(Promise.resolve([entity])),
    key: sinon.stub().returns(key),
    save: sinon.stub().returns(Promise.resolve())
  };
  const DatastoreMock = sinon.stub().returns(datastore);

  return {
    program: proxyquire(`../`, {
      '@google-cloud/datastore': DatastoreMock
    }),
    mocks: {
      Datastore: DatastoreMock,
      datastore: datastore,
      key: key,
      entity: entity,
      req: {
        body: {
          kind: KIND,
          key: NAME,
          value: VALUE
        }
      },
      res: {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis()
      }
    }
  };
}

describe(`functions:datastore`, () => {
  it(`set: Set fails without a value`, () => {
    const expectedMsg = `Value not provided. Make sure you have a "value" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.value = undefined;
      sample.program.set(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`set: Set fails without a key`, () => {
    const expectedMsg = `Key not provided. Make sure you have a "key" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.key = undefined;
      sample.program.set(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`set: Set fails without a kind`, () => {
    const expectedMsg = `Kind not provided. Make sure you have a "kind" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.kind = undefined;
      sample.program.set(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`set: Handles save error`, () => {
    const error = new Error(`error`);
    const sample = getSample();

    sample.mocks.datastore.save.returns(Promise.reject(error));

    return sample.program.set(sample.mocks.req, sample.mocks.res)
      .then(() => {
        throw new Error(`Should have failed!`);
      })
      .catch((err) => {
        assert.deepEqual(err, error);
        assert.deepEqual(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
      });
  });

  it(`set: Set saves an entity`, () => {
    const expectedMsg = `Entity ${KIND}/${NAME} saved.`;
    const sample = getSample();

    return sample.program.set(sample.mocks.req, sample.mocks.res)
      .then(() => {
        assert.deepEqual(sample.mocks.datastore.save.callCount, 1);
        assert.deepEqual(sample.mocks.datastore.save.firstCall.args, [sample.mocks.entity]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [200]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [expectedMsg]);
      });
  });

  it(`get: Get fails without a key`, () => {
    const expectedMsg = `Key not provided. Make sure you have a "key" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.key = undefined;
      sample.program.get(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`get: Get fails without a kind`, () => {
    const expectedMsg = `Kind not provided. Make sure you have a "kind" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.kind = undefined;
      sample.program.get(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`get: Handles get error`, () => {
    const error = new Error(`error`);
    const sample = getSample();

    sample.mocks.datastore.get.returns(Promise.reject(error));

    return sample.program.get(sample.mocks.req, sample.mocks.res)
      .then(() => {
        throw new Error(`Should have failed!`);
      })
      .catch((err) => {
        assert.deepEqual(err, error);
        assert.deepEqual(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
      });
  });

  it(`get: Fails when entity does not exist`, () => {
    const sample = getSample();
    const error = new Error(`No entity found for key ${sample.mocks.key.path.join('/')}.`);

    sample.mocks.datastore.get.returns(Promise.resolve([]));

    return sample.program.get(sample.mocks.req, sample.mocks.res)
      .then(() => {
        throw new Error(`Should have failed!`);
      })
      .catch((err) => {
        assert.deepEqual(err, error);
        assert.deepEqual(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
      });
  });

  it(`get: Finds an entity`, () => {
    const sample = getSample();

    return sample.program.get(sample.mocks.req, sample.mocks.res)
      .then(() => {
        assert.deepEqual(sample.mocks.datastore.get.callCount, 1);
        assert.deepEqual(sample.mocks.datastore.get.firstCall.args, [sample.mocks.key]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [200]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [sample.mocks.entity]);
      });
  });

  it(`del: Delete fails without a key`, () => {
    const expectedMsg = `Key not provided. Make sure you have a "key" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.key = undefined;
      sample.program.del(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`del: Delete fails without a kind`, () => {
    const expectedMsg = `Kind not provided. Make sure you have a "kind" property in your request`;
    const sample = getSample();

    assert.throws(() => {
      sample.mocks.req.body.kind = undefined;
      sample.program.del(sample.mocks.req, sample.mocks.res);
    }, Error, expectedMsg);
  });

  it(`del: Handles delete error`, () => {
    const error = new Error(`error`);
    const sample = getSample();

    sample.mocks.datastore.delete.returns(Promise.reject(error));

    return sample.program.del(sample.mocks.req, sample.mocks.res)
      .then(() => {
        throw new Error(`Should have failed!`);
      })
      .catch((err) => {
        assert.deepEqual(err, error);
        assert.deepEqual(console.error.callCount, 1);
        assert.deepEqual(console.error.firstCall.args, [error]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [500]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [error]);
      });
  });

  it(`del: Deletes an entity`, () => {
    const expectedMsg = `Entity ${KIND}/${NAME} deleted.`;
    const sample = getSample();

    return sample.program.del(sample.mocks.req, sample.mocks.res)
      .then(() => {
        assert.deepEqual(sample.mocks.datastore.delete.callCount, 1);
        assert.deepEqual(sample.mocks.datastore.delete.firstCall.args, [sample.mocks.key]);
        assert.deepEqual(sample.mocks.res.status.callCount, 1);
        assert.deepEqual(sample.mocks.res.status.firstCall.args, [200]);
        assert.deepEqual(sample.mocks.res.send.callCount, 1);
        assert.deepEqual(sample.mocks.res.send.firstCall.args, [expectedMsg]);
      });
  });
});
