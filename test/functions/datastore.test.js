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

var test = require('ava');
var sinon = require('sinon');
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
  var gcloud = {
    datastore: sinon.stub().returns(datastore)
  };
  return {
    sample: proxyquire('../../functions/datastore', {
      gcloud: gcloud
    }),
    mocks: {
      gcloud: gcloud,
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

test('set: Set fails without a value', function (t) {
  var expectedMsg = 'Value not provided. Make sure you have a "value" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.set(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('set: Set fails without a key', function (t) {
  var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.set(context, {
    value: {}
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('set: Set fails without a kind', function (t) {
  var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.set(context, {
    value: {},
    key: KEY
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('set: Handles save error', function (t) {
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

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(datastoreSample.mocks.datastore.save.calledOnce, true);
});

test('set: Set saves an entity', function (t) {
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

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedMsg);
  t.is(context.failure.called, false);
  t.is(datastoreSample.mocks.datastore.key.calledOnce, true);
  t.deepEqual(
    datastoreSample.mocks.datastore.key.firstCall.args[0],
    [data.kind, data.key]
  );
  t.is(datastoreSample.mocks.datastore.save.calledOnce, true);
  t.deepEqual(datastoreSample.mocks.datastore.save.firstCall.args[0], {
    key: {
      kind: data.kind,
      path: data.key
    },
    data: data.value
  });
});

test('get: Get fails without a key', function (t) {
  var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.get(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('get: Get fails without a kind', function (t) {
  var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.get(context, {
    key: KEY
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('get: Handles get error', function (t) {
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

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(datastoreSample.mocks.datastore.get.calledOnce, true);
});

test('get: Fails when entity does not exist', function (t) {
  var expectedMsg = 'No entity found for key key';
  var context = getMockContext();
  var datastoreSample = getSample();

  datastoreSample.sample.get(context, {
    key: KEY,
    kind: KIND
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(datastoreSample.mocks.datastore.get.calledOnce, true);
});

test('get: Finds an entity', function (t) {
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

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedResult);
  t.is(context.failure.called, false);
  t.is(datastoreSample.mocks.datastore.get.calledOnce, true);
  t.deepEqual(
    datastoreSample.mocks.datastore.get.firstCall.args[0],
    {
      path: KEY,
      kind: KIND
    }
  );
});

test('del: Delete fails without a key', function (t) {
  var expectedMsg = 'Key not provided. Make sure you have a "key" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.del(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('del: Delete fails without a kind', function (t) {
  var expectedMsg = 'Kind not provided. Make sure you have a "kind" ' +
    'property in your request';
  var context = getMockContext();

  getSample().sample.del(context, {
    key: KEY
  });

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});

test('del: Handles delete error', function (t) {
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

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
  t.is(datastoreSample.mocks.datastore.delete.calledOnce, true);
});

test('del: Deletes an entity', function (t) {
  var expectedMsg = 'Entity deleted';
  var context = getMockContext();
  var datastoreSample = getSample();

  datastoreSample.sample.del(context, {
    key: KEY,
    kind: KIND
  });

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedMsg);
  t.is(context.failure.called, false);
  t.is(datastoreSample.mocks.datastore.delete.calledOnce, true);
  t.deepEqual(
    datastoreSample.mocks.datastore.delete.firstCall.args[0],
    {
      path: KEY,
      kind: KIND
    }
  );
});
