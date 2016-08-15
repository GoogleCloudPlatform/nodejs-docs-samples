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

var example = require('../query');

describe('bigquery:query', function () {
  describe('sync_query', function () {
    it('should fetch data given a query', function (done) {
      example.syncQuery(
        { query: 'SELECT * FROM publicdata:samples.natality LIMIT 5;' },
        function (err, data) {
          assert.ifError(err);
          assert.notEqual(data, null);
          assert(Array.isArray(data));
          assert(data.length === 5);
          done();
        }
      );
    });
  });

  describe('async_query', function () {
    it('should submit a job and fetch its results', function (done) {
      example.asyncQuery(
        { query: 'SELECT * FROM publicdata:samples.natality LIMIT 5;' },
        function (err, job) {
          assert.ifError(err);
          assert.notEqual(job.id, null);

          var poller = function (tries) {
            example.asyncPoll(job.id, function (err, data) {
              if (!err || tries === 0) {
                assert.ifError(err);
                assert.notEqual(data, null);
                assert(Array.isArray(data));
                assert(data.length === 5);
                done();
              } else {
                setTimeout(function () { poller(tries - 1); }, 1000);
              }
            });
          };

          poller(5);
        }
      );
    });
  });
});
