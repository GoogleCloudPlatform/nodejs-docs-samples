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

var assert = require('assert');

var logSample = require('../../functions/log');

describe('functions/log', function () {
  it('should write to log', function (done) {
    var logMessage = 'I am a log entry!';
    var messageWasPrinted = false;
    var originalLog = console.log;

    console.log = function (data) {
      if (data === logMessage) {
        messageWasPrinted = true;
      }
    };

    logSample.log({
      success: function (result) {
        try {
          assert.equal(result, undefined);
          if (messageWasPrinted) {
            console.log = originalLog;
            done();
          } else {
            console.log = originalLog;
            done('message was not printed!');
          }
        } catch (err) {
          console.log = originalLog;
          done(err);
        }
      }
    });
  });
  it('should write to log 2', function (done) {
    var logMessage = 'My GCF Function: foo';
    var messageWasPrinted = false;
    var originalLog = console.log;

    console.log = function (data) {
      if (data === logMessage) {
        messageWasPrinted = true;
      }
    };

    logSample.helloworld({
      success: function (result) {
        try {
          assert.equal(result, undefined);
          if (messageWasPrinted) {
            console.log = originalLog;
            done();
          } else {
            console.log = originalLog;
            done('message was not printed!');
          }
        } catch (err) {
          console.log = originalLog;
          done(err);
        }
      }
    },
    {
      message: 'foo'
    });
  });
  it('should write to log 3', function (done) {
    var logMessage = 'My GCF Function: foo';
    logSample.hellohttp({
      success: function (result) {
        try {
          assert.equal(result, logMessage);
          done();
        } catch (err) {
          done(err);
        }
      }
    },
    {
      message: 'foo'
    });
  });
});
