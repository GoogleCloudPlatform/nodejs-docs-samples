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
var path = require('path');
var proxyquire = require('proxyquire').noPreserveCache();
var request = require('supertest');

var SAMPLE_PATH = path.join(__dirname, '../server.js');

function getSample () {
  var testApp = express();
  sinon.stub(testApp, 'listen').callsArg(1);
  var expressMock = sinon.stub().returns(testApp);
  var resultsMock = [
    {
      timestamp: '1234',
      userIp: 'abcd'
    }
  ];
  var connectionMock = {
    query: sinon.stub()
  };
  connectionMock.query.onFirstCall().callsArg(2);
  connectionMock.query.onSecondCall().callsArgWith(1, null, resultsMock);

  var mysqlMock = {
    createConnection: sinon.stub().returns(connectionMock)
  };

  var app = proxyquire(SAMPLE_PATH, {
    mysql: mysqlMock,
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock,
      results: resultsMock,
      connection: connectionMock,
      mysql: mysqlMock
    }
  };
}

describe('appengine/cloudsql/server.js', function () {
  var sample;

  beforeEach(function () {
    sample = getSample();

    assert(sample.mocks.express.calledOnce);
    assert(sample.mocks.mysql.createConnection.calledOnce);
    assert.deepEqual(sample.mocks.mysql.createConnection.firstCall.args[0], {
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      socketPath: process.env.MYSQL_SOCKET_PATH,
      database: process.env.MYSQL_DATABASE
    });
    assert(sample.app.listen.calledOnce);
    assert.equal(sample.app.listen.firstCall.args[0], process.env.PORT || 8080);
  });

  it('should record a visit', function (done) {
    var expectedResult = 'Last 10 visits:\nTime: 1234, AddrHash: abcd';

    request(sample.app)
      .get('/')
      .expect(200)
      .expect(function (response) {
        assert.equal(response.text, expectedResult);
      })
      .end(done);
  });

  it('should handle insert error', function (done) {
    var expectedResult = 'insert_error';

    sample.mocks.connection.query.onFirstCall().callsArgWith(2, expectedResult);

    request(sample.app)
      .get('/')
      .expect(500)
      .expect(function (response) {
        assert.equal(response.text, expectedResult + '\n');
      })
      .end(done);
  });

  it('should handle read error', function (done) {
    var expectedResult = 'read_error';

    sample.mocks.connection.query.onSecondCall().callsArgWith(1, expectedResult);

    request(sample.app)
      .get('/')
      .expect(500)
      .expect(function (response) {
        assert.equal(response.text, expectedResult + '\n');
      })
      .end(done);
  });
});
