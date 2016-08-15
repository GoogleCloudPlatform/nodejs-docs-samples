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

var KEY = 'key';
var KIND = 'user';

function getSample () {
  var datastore = {
    delete: sinon.stub().callsArg(1),
    get: sinon.stub().callsArg(1),
    key: sinon.stub().returns({
      kind: KIND,
      path: KEY
    }),
    save: sinon.stub().callsArg(1)
  };
  var DatastoreMock = sinon.stub().returns(datastore);
  return {
    sample: proxyquire('../', {
      '@google-cloud/datastore': DatastoreMock
    }),
    mocks: {
      Datastore: DatastoreMock,
      datastore: datastore
    }
  };
}

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

describe('functions:datastore', function () {
  it('set: Set fails without a value', function () {
    var expectedMsg = 'Value not provided. Make sure you have a "value" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.set(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('set: Set fails without a key', function () {
    var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.set(context, {
      value: {}
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('set: Set fails without a kind', function () {
    var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.set(context, {
      value: {},
      key: KEY
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('set: Handles save error', function () {
    var expectedMsg = 'test error';
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.mocks.datastore.save = sinon.stub().callsArgWith(
      1,
      expectedMsg
    );

    datastoreSample.sample.set(context, {
      value: {},
      key: KEY,
      kind: KIND
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(datastoreSample.mocks.datastore.save.calledOnce, true);
  });

  it('set: Set saves an entity', function () {
    var expectedMsg = 'Entity saved';
    var context = getMockContext();
    var datastoreSample = getSample();

    var data = {
      value: {
        name: 'John'
      },
      key: KEY,
      kind: KIND
    };

    datastoreSample.sample.set(context, data);

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedMsg);
    assert.equal(context.failure.called, false);
    assert.equal(datastoreSample.mocks.datastore.key.calledOnce, true);
    assert.deepEqual(
      datastoreSample.mocks.datastore.key.firstCall.args[0],
      [data.kind, data.key]
    );
    assert.equal(datastoreSample.mocks.datastore.save.calledOnce, true);
    assert.deepEqual(datastoreSample.mocks.datastore.save.firstCall.args[0], {
      key: {
        kind: data.kind,
        path: data.key
      },
      data: data.value
    });
  });

  it('get: Get fails without a key', function () {
    var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.get(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('get: Get fails without a kind', function () {
    var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.get(context, {
      key: KEY
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('get: Handles get error', function () {
    var expectedMsg = 'test error';
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.mocks.datastore.get = sinon.stub().callsArgWith(
      1,
      expectedMsg
    );

    datastoreSample.sample.get(context, {
      key: KEY,
      kind: KIND
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(datastoreSample.mocks.datastore.get.calledOnce, true);
  });

  it('get: Fails when entity does not exist', function () {
    var expectedMsg = 'No entity found for key key';
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.sample.get(context, {
      key: KEY,
      kind: KIND
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(datastoreSample.mocks.datastore.get.calledOnce, true);
  });

  it('get: Finds an entity', function () {
    var expectedResult = {
      name: 'John'
    };
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.mocks.datastore.get = sinon.stub().callsArgWith(
      1,
      null,
      expectedResult
    );
    datastoreSample.sample.get(context, {
      key: KEY,
      kind: KIND
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedResult);
    assert.equal(context.failure.called, false);
    assert.equal(datastoreSample.mocks.datastore.get.calledOnce, true);
    assert.deepEqual(
      datastoreSample.mocks.datastore.get.firstCall.args[0],
      {
        path: KEY,
        kind: KIND
      }
    );
  });

  it('del: Delete fails without a key', function () {
    var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.del(context, {});

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('del: Delete fails without a kind', function () {
    var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
      'property in your request';
    var context = getMockContext();

    getSample().sample.del(context, {
      key: KEY
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
  });

  it('del: Handles delete error', function () {
    var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
      'property in your request';
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.mocks.datastore.delete = sinon.stub().callsArgWith(
      1,
      expectedMsg
    );

    datastoreSample.sample.del(context, {
      key: KEY,
      kind: KIND
    });

    assert.equal(context.failure.calledOnce, true);
    assert.equal(context.failure.firstCall.args[0], expectedMsg);
    assert.equal(context.success.called, false);
    assert.equal(datastoreSample.mocks.datastore.delete.calledOnce, true);
  });

  it('del: Deletes an entity', function () {
    var expectedMsg = 'Entity deleted';
    var context = getMockContext();
    var datastoreSample = getSample();

    datastoreSample.sample.del(context, {
      key: KEY,
      kind: KIND
    });

    assert.equal(context.success.calledOnce, true);
    assert.equal(context.success.firstCall.args[0], expectedMsg);
    assert.equal(context.failure.called, false);
    assert.equal(datastoreSample.mocks.datastore.delete.calledOnce, true);
    assert.deepEqual(
      datastoreSample.mocks.datastore.delete.firstCall.args[0],
      {
        path: KEY,
        kind: KIND
      }
    );
  });
});
