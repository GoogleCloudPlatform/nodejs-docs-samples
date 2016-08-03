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

var path = require('path');
var proxyquire = require('proxyquire').noPreserveCache();

var SAMPLE_PATH = path.join(__dirname, '../createTables.js');

function getSample () {
  var connectionMock = {
    query: sinon.stub(),
    end: sinon.stub()
  };
  connectionMock.query.onFirstCall().callsArgWith(1, null, 'created visits table!');
  var mysqlMock = {
    createConnection: sinon.stub().returns(connectionMock)
  };
  var configMock = {
    user: 'user',
    password: 'password',
    database: 'database',
    socketPath: 'socketPath'
  };
  var promptMock = {
    start: sinon.stub(),
    get: sinon.stub().callsArgWith(1, null, configMock)
  };

  proxyquire(SAMPLE_PATH, {
    mysql: mysqlMock,
    prompt: promptMock
  });
  return {
    mocks: {
      connection: connectionMock,
      mysql: mysqlMock,
      config: configMock,
      prompt: promptMock
    }
  };
}

describe('appengine/cloudsql/createTables.js', function () {
  it('should record a visit', function (done) {
    var sample = getSample();
    var expectedResult = 'created visits table!';

    assert(sample.mocks.prompt.start.calledOnce);
    assert(sample.mocks.prompt.get.calledOnce);
    assert.deepEqual(sample.mocks.prompt.get.firstCall.args[0], [
      'socketPath',
      'user',
      'password',
      'database'
    ]);

    setTimeout(function () {
      assert.deepEqual(sample.mocks.mysql.createConnection.firstCall.args[0], sample.mocks.config);
      assert(console.log.calledWith(expectedResult));
      done();
    }, 10);
  });

  it('should handle prompt error', function (done) {
    var expectedResult = 'createTables_prompt_error';
    var sample = getSample();

    proxyquire(SAMPLE_PATH, {
      mysql: sample.mocks.mysql,
      prompt: {
        start: sinon.stub(),
        get: sinon.stub().callsArgWith(1, expectedResult)
      }
    });

    setTimeout(function () {
      assert(console.error.calledWith(expectedResult));
      done();
    }, 10);
  });

  it('should handle insert error', function (done) {
    var expectedResult = 'createTables_insert_error';
    var sample = getSample();

    var connectionMock = {
      query: sinon.stub().callsArgWith(1, expectedResult)
    };

    proxyquire(SAMPLE_PATH, {
      mysql: {
        createConnection: sinon.stub().returns(connectionMock)
      },
      prompt: sample.mocks.prompt
    });

    setTimeout(function () {
      assert(console.error.calledWith(expectedResult));
      done();
    }, 10);
  });
});
