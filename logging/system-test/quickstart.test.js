// Copyright 2015-2016, Google, Inc.
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

var proxyquire = require('proxyquire').noPreserveCache();
var logging = proxyquire('@google-cloud/logging', {})();
var uuid = require('node-uuid');

var logName = 'nodejs-docs-samples-test-' + uuid.v4();

describe.only('logging:quickstart', function () {
  var logMock, loggingMock, LoggingMock;

  after(function (done) {
    logging.log(logName).delete(function () {
      // Ignore any error, the topic might not have been created
      done();
    });
  });

  it('should log an entry', function (done) {
    var expectedlogName = 'my-log';

    logMock = {
      entry: sinon.stub().returns({}),
      write: function (_entry) {
        assert.deepEqual(_entry, {});

        var log = logging.log(logName);
        var entry = log.entry({ type: 'global' }, 'Hello, world!');
        log.write(entry, function (err, apiResponse) {
          assert.ifError(err);
          assert.notEqual(apiResponse, undefined);
          // Logs are eventually consistent
          setTimeout(done, 5000);
        });
      }
    };
    loggingMock = {
      log: function (_logName) {
        assert.equal(_logName, expectedlogName);
        return logMock;
      }
    };
    LoggingMock = sinon.stub().returns(loggingMock);

    proxyquire('../quickstart', {
      '@google-cloud/logging': LoggingMock
    });
  });
});
