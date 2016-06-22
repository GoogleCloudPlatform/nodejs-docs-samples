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
var helloworldSample = proxyquire('../../functions/helloworld', {});

function getMockContext () {
  return {
    success: sinon.stub(),
    failure: sinon.stub()
  };
}

test.before(function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
});

test('helloworld:helloworld: should log a message', function (t) {
  var expectedMsg = 'My Cloud Function: hi';
  var context = getMockContext();
  helloworldSample.helloWorld(context, {
    message: 'hi'
  });

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});

test.cb('helloworld:helloGET: should print hello world', function (t) {
  var expectedMsg = 'Hello World!';
  helloworldSample.helloGET({}, {
    send: function (message) {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test.cb('helloworld:helloHttp: should print a name', function (t) {
  var expectedMsg = 'Hello John!';
  helloworldSample.helloHttp({
    body: {
      name: 'John'
    }
  }, {
    send: function (message) {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test.cb('helloworld:helloHttp: should print hello world', function (t) {
  var expectedMsg = 'Hello World!';
  helloworldSample.helloHttp({
    body: {}
  }, {
    send: function (message) {
      t.is(message, expectedMsg);
      t.end();
    }
  });
});

test('helloworld:helloBackground: should print a name', function (t) {
  var expectedMsg = 'Hello John!';
  var context = getMockContext();
  helloworldSample.helloBackground(context, {
    name: 'John'
  });

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedMsg);
  t.is(context.failure.called, false);
});

test('helloworld:helloBackground: should print hello world', function (t) {
  var expectedMsg = 'Hello World!';
  var context = getMockContext();
  helloworldSample.helloBackground(context, {});

  t.is(context.success.calledOnce, true);
  t.is(context.success.firstCall.args[0], expectedMsg);
  t.is(context.failure.called, false);
});

test('helloworld:helloPubSub: should print a name', function (t) {
  var expectedMsg = 'Hello Bob!';
  var context = getMockContext();
  helloworldSample.helloPubSub(context, {
    name: 'Bob'
  });

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});

test('helloworld:helloPubSub: should print hello world', function (t) {
  var expectedMsg = 'Hello World!';
  var context = getMockContext();
  helloworldSample.helloPubSub(context, {});

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});

test('helloworld:helloGCS: should print a name', function (t) {
  var expectedMsg = 'Hello Sally!';
  var context = getMockContext();
  helloworldSample.helloGCS(context, {
    name: 'Sally'
  });

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});

test('helloworld:helloGCS: should print hello world', function (t) {
  var expectedMsg = 'Hello World!';
  var context = getMockContext();
  helloworldSample.helloGCS(context, {});

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
