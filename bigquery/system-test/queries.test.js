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

var program = require('../queries');

var sqlQuery = 'SELECT * FROM `publicdata.samples.natality` LIMIT 5;';

describe('bigquery:queries', function () {
  describe('syncQuery', function () {
    it('should fetch data given a query', function (done) {
      program.syncQuery(sqlQuery, function (err, data) {
        assert.equal(err, null);
        assert.equal(Array.isArray(data), true);
        assert.equal(data.length, 5);

        done();
      });
    });
  });

  describe('asyncQuery', function () {
    it('should submit a job and fetch its results', function (done) {
      program.asyncQuery(sqlQuery, function (err, data) {
        assert.equal(err, null);
        assert.equal(Array.isArray(data), true);
        assert.equal(data.length, 5);

        done();
      });
    });
  });
});
