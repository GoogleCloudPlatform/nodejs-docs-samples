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

function getSample () {
  var requestPromise = sinon.stub().returns(new Promise(function (resolve) {
    resolve('test');
  }));
  return {
    sample: proxyquire('../../functions/background', {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

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

test('should echo message', function (t) {
  var expectedMsg = 'hi';
  var context = getMockContext();
  var backgroundSample = getSample();
  backgroundSample.sample.helloWorld(context, {
    message: expectedMsg
  });

  t.is(context.success.calledOnce, true);
  t.is(context.failure.called, false);
  t.is(console.log.calledWith(expectedMsg), true);
});
test('should say no message was provided', function (t) {
  var expectedMsg = 'No message defined!';
  var context = getMockContext();
  var backgroundSample = getSample();
  backgroundSample.sample.helloWorld(context, {});

  t.is(context.failure.calledOnce, true);
  t.is(context.failure.firstCall.args[0], expectedMsg);
  t.is(context.success.called, false);
});
test.cb.serial('should make a promise request', function (t) {
  var backgroundSample = getSample();
  backgroundSample.sample.helloPromise({
    endpoint: 'foo.com'
  }).then(function (result) {
    t.deepEqual(backgroundSample.mocks.requestPromise.firstCall.args[0], {
      uri: 'foo.com'
    });
    t.is(result, 'test');
    t.end();
  }, function () {
    t.fail();
  });
});

test.after(function () {
  console.error.restore();
  console.log.restore();
});
