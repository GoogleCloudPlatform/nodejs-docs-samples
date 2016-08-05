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

var example = require('../sync_query');
var querySpy = sinon.spy(example.bigquery, 'query');

describe('bigquery:sync_query', function () {
  describe('sync_query', function () {
    it('should fetch data given a query', function (done) {
      querySpy.reset();
      example.syncQuery(
        {
          query: 'SELECT * FROM publicdata:samples.natality LIMIT 5;'
        },
        function (err, data) {
          assert.ifError(err);
          assert.notEqual(data, null);
          assert(Array.isArray(data));
          assert(data.length === 5);
          assert(example.bigquery.query.calledOnce);
          done();
        }
      );
    });

    it('should paginate and re-call bigquery.query', function (done) {
      querySpy.reset();
      example.syncQuery(
        {
          query: 'SELECT * FROM publicdata:samples.natality LIMIT 15;',
          maxResults: 5
        },
        function (err, data) {
          assert.ifError(err);
          assert.notEqual(data, null);
          assert(Array.isArray(data));
          assert(data.length === 15);
          assert(example.bigquery.query.calledThrice);
          done();
        }
      );
    });
  });
});
