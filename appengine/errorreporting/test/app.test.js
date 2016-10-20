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

var express = require('express');
var winston = require('winston');
var path = require('path');
var proxyquire = require('proxyquire').noPreserveCache();
var request = require('supertest');

var SAMPLE_PATH = path.join(__dirname, '../app.js');

function getSample () {
  var testApp = express();
  sinon.stub(testApp, 'listen').callsArg(1);
  var expressMock = sinon.stub().returns(testApp);
  var resultsMock = JSON.stringify({
    timestamp: '1234',
    userIp: 'abcd'
  }) + '\n';
  var winstonMock = {
    add: sinon.stub(),
    error: sinon.stub()
  };

  var app = proxyquire(SAMPLE_PATH, {
    winston: winstonMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      winston: winstonMock
    }
  };
}

describe('appengine/errorreporting/app.js', function () {
  var sample;

  beforeEach(function () {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.mocks.winston.add.calledOnce);
    assert.strictEqual(sample.mocks.winston.add.firstCall.args[0], winston.transports.File);
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it('should throw an error', function (done) {
    var expectedResult = 'something is wrong!';

    request(sample.app)
      .get('/')
      .expect(500)
      .expect(function (response) {
        assert(sample.mocks.winston.error.calledOnce);
        assert.equal(response.text, expectedResult);
      })
      .end(done);
  });
});
