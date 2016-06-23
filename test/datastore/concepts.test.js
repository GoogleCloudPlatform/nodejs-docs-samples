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

var test = require('ava');
var testUtil = require('./util.js');
var concepts = require('../../datastore/concepts');

var transaction;
var metadata;
var index;
var query;
var entity;

var Transaction = concepts.Transaction;
var Metadata = concepts.Metadata;
var Index = concepts.Index;
var Entity = concepts.Entity;
var Query = concepts.Query;

test.before(function () {
  var projectId = process.env.GCLOUD_PROJECT || 'nodejs-docs-samples';
  transaction = new Transaction(projectId);
  metadata = new Metadata(projectId);
  index = new Index(projectId);
  entity = new Entity(projectId);
  query = new Query(projectId);
});

test.after.cb.serial(function (t) {
  var datastore = transaction.datastore;
  var query = datastore.createQuery('Task');

  testUtil.deleteEntities(datastore, query, t.end);
});

// Transactions

test.cb.serial('performs a transactional update', function (t) {
  transaction.testTransactionalUpdate(t.end);
});

test.cb.serial('performs retries if necessary', function (t) {
  transaction.testTransactionalRetry(t.end);
});

test.cb.serial('performs a get or create', function (t) {
  transaction.testTransactionalGetOrCreate(t.end);
});

test.cb.serial('gets a snapshot of task list entities', function (t) {
  transaction.testSingleEntityGroupReadOnly(t.end);
});

// Metadata

test.cb.serial('performs a namespace query', function (t) {
  metadata.testNamespaceRunQuery(t.end);
});

test.cb.serial('performs a kind query', function (t) {
  metadata.testKindRunQuery(t.end);
});

test.cb.serial('performs a property query', function (t) {
  metadata.testPropertyRunQuery(t.end);
});

test.cb.serial('performs a property by kind query', function (t) {
  metadata.testPropertyByKindRunQuery(t.end);
});

// Indexes

test.cb.serial(
  'performs a query with a filter on an unindexed property',
  function (t) {
    index.testUnindexedPropertyQuery(t.end);
  }
);

test.cb.serial('inserts arrays of data', function (t) {
  index.testExplodingProperties(t.end);
});

// Queries

test.cb.serial('performs a basic query', function (t) {
  query.testRunQuery(t.end);
});

test.cb.serial('performs a query with a property filter', function (t) {
  query.testPropertyFilter(t.end);
});

test.cb.serial('performs a query with a composite filter', function (t) {
  query.testCompositeFilter(t.end);
});

test.cb.serial('performs a query with a key filter', function (t) {
  query.testKeyFilter(t.end);
});

test.cb.serial('performs a query with ascending sort', function (t) {
  query.testAscendingSort(t.end);
});

test.cb.serial('performs a query with descending sort', function (t) {
  query.testDescendingSort(t.end);
});

test.cb.serial('performs a query with multi sort', function (t) {
  query.testMultiSort(t.end);
});

test.cb.serial('performs a kindless query', function (t) {
  query.testKindlessQuery(t.end);
});

test.cb.serial('performs a projection query', function (t) {
  entity.testProperties(function (err, tasks) {
    console.log(err, tasks);
    t.ifError(err);
    setTimeout(function () {
      query.testRunQueryProjection(t.end);
    }, 1000);
  });
});

test.cb.serial('performs a keys only query', function (t) {
  query.testKeysOnlyQuery(t.end);
});

test.cb.serial('performs a distinct query', function (t) {
  query.testDistinctQuery(t.end);
});

test.cb.serial('performs a distinct on query', function (t) {
  query.testDistinctOnQuery(t.end);
});

test.cb.serial('performs an array value inequality query', function (t) {
  query.testArrayValueInequalityRange(t.end);
});

test.cb.serial('performs an array value equality query', function (t) {
  query.testArrayValueEquality(t.end);
});

test.cb.serial('performs an inequality range query', function (t) {
  query.testInequalityRange(t.end);
});

test.cb.serial('returns an error from an invalid query', function (t) {
  query.testInequalityInvalid(function (err) {
    t.truthy(err);
    t.end();
  });
});

test.cb.serial('performs an equal and inequality range query', function (t) {
  query.testEqualAndInequalityRange(t.end);
});

test.cb.serial('performs an equality sort query', function (t) {
  query.testInequalitySort(t.end);
});

test.cb.serial(
  'returns an error when not sorted on filtered property',
  function (t) {
    query.testInequalitySortInvalidNotSame(function (err) {
      t.truthy(err);
      t.end();
    });
  }
);

test.cb.serial(
  'returns an error when not sorted on first filter prop',
  function (t) {
    query.testInequalitySortInvalidNotFirst(function (err) {
      t.truthy(err);
      t.end();
    });
  }
);

test.cb.serial('performs a query with a limit', function (t) {
  query.testLimit(t.end);
});

test.cb.serial.skip('allows manual pagination through results', function (t) {
  entity.testBatchUpsert(function (err) {
    t.ifError(err);
    setTimeout(function () {
      query.testCursorPaging(t.end);
    }, 1000);
  });
});

test.skip('performs an ancestor query', function (t) {
  query.testEventualConsistentQuery(t.end);
});

// Entities

test.cb.serial('saves with an incomplete key', function (t) {
  entity.testIncompleteKey(t.end);
});

test.cb.serial('saves with a named key', function (t) {
  entity.testNamedKey(t.end);
});

test.cb.serial('saves a key with a parent', function (t) {
  entity.testKeyWithParent(t.end);
});

test.cb.serial('saves a key with multiple parents', function (t) {
  entity.testKeyWithMultiLevelParent(t.end);
});

test.cb.serial('saves an entity with a parent', function (t) {
  entity.testEntityWithParent(t.end);
});

test.cb.serial('saves an entity with properties', function (t) {
  entity.testProperties(t.end);
});

test.cb.serial('saves an entity with arrays', function (t) {
  entity.testArrayValue(t.end);
});

test.cb.serial('saves a basic entity', function (t) {
  entity.testBasicEntity(t.end);
});

test.cb.serial('saves with an upsert', function (t) {
  entity.testUpsert(t.end);
});

test.cb.serial('saves with an insert', function (t) {
  entity.testInsert(t.end);
});

test.cb.serial('performs a lookup', function (t) {
  entity.testLookup(t.end);
});

test.cb.serial('saves with an update', function (t) {
  entity.testUpdate(t.end);
});

test.cb.serial('deletes an entity', function (t) {
  entity.testDelete(t.end);
});

test.cb.serial('performs a batch upsert', function (t) {
  entity.testBatchUpsert(t.end);
});

test.cb.serial('performs a batch lookup', function (t) {
  entity.testBatchLookup(t.end);
});

test.cb.serial('performs a batch delete', function (t) {
  entity.testBatchDelete(t.end);
});
