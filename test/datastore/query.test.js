// Copyright 2015, Google, Inc.
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

var Query = require('../../datastore/concepts').Query;
var query;

describe('datastore/concepts/query', function () {
  before(function() {
    var projectId = process.env.TEST_PROJECT_ID || 'nodejs-docs-samples';
    query = new Query(projectId);
  });

  describe('basic query', function() {
    it('performs a basic query', function(done) {
      query.testRunQuery(done);
    });
  });

  describe('property filter', function() {
    it('performs a query with a property filter', function(done) {
      query.testPropertyFilter(done);
    });
  });

  describe('composite filter', function() {
    it('performs a query with a composite filter', function(done) {
      query.testCompositeFilter(done);
    });
  });

  describe('key filter', function() {
    it('performs a query with a key filter', function(done) {
      query.testKeyFilter(done);
    });
  });

  describe('ascending sort', function() {
    it('performs a query with ascending sort', function(done) {
      query.testAscendingSort(done);
    });
  });

  describe('descending sort', function() {
    it('performs a query with descending sort', function(done) {
      query.testDescendingSort(done);
    });
  });

  describe('multi sort', function() {
    it('performs a query with multi sort', function(done) {
      query.testMultiSort(done);
    });
  });

  describe('kindless query', function() {
    it('performs a kindless query', function(done) {
      query.testKindlessQuery(done);
    });
  });

  describe('projection query', function() {
    it('performs a projection query', function(done) {
      query.testRunQueryProjection(done);
    });
  });

  describe('keys only query', function() {
    it('performs a keys only query', function(done) {
      query.testKeysOnlyQuery(done);
    });
  });

  describe('distinct query', function() {
    it('performs a distinct query', function(done) {
      query.testDistinctQuery(done);
    });
  });

  describe('distinct on query', function() {
    it('performs a distinct on query', function(done) {
      query.testDistinctOnQuery(done);
    });
  });

  describe('array value inequality range', function() {
    it('performs an array value inequality query', function(done) {
      query.testArrayValueInequalityRange(done);
    });
  });

  describe('array value equality', function() {
    it('performs an array value equality query', function(done) {
      query.testArrayValueEquality(done);
    });
  });

  describe('inequality range', function() {
    it('performs an inequality range query', function(done) {
      query.testInequalityRange(done);
    });
  });

  describe('inequality invalid', function() {
    it('returns an error from an invalid query', function(done) {
      query.testInequalityInvalid(function(err) {
        assert.notStrictEqual(err, null);
        done();
      });
    });
  });

  describe('equal and inequality range', function() {
    it('performs an equal and inequality range query', function(done) {
      query.testEqualAndInequalityRange(done);
    });
  });

  describe('inequality sort', function() {
    it('performs an equality sort query', function(done) {
      query.testInequalitySort(done);
    });
  });

  describe('inequality sort invalid', function() {
    it('returns an error when not sorted on filtered property', function(done) {
      query.testInequalitySortInvalidNotSame(function(err) {
        assert.notStrictEqual(err, null);
        done();
      });
    });

    it('returns an error when not sorted on first filter prop', function(done) {
      query.testInequalitySortInvalidNotFirst(function(err) {
        assert.notStrictEqual(err, null);
        done();
      });
    });
  });

  describe('limit query', function() {
    it('performs a query with a limit', function(done) {
      query.testLimit(done);
    });
  });

  describe('cursor paging', function() {
    it('allows manual pagination through results', function(done) {
      query.testCursorPaging(done);
    });
  });

  describe.skip('eventually consistent query', function() {
    it('performs an ancestor query', function(done) {
      query.testEventualConsistentQuery(done);
    });
  });
});
