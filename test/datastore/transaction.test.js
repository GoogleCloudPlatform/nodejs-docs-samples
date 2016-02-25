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

var testUtil = require('./util.js');

var Transaction = require('../../datastore/concepts').Transaction;
var transaction;

describe('datastore/concepts/transaction', function () {
  before(function() {
    var projectId = process.env.GCLOUD_PROJECT || 'nodejs-docs-samples';
    transaction = new Transaction(projectId);
  });

  after(function(done) {
    var datastore = transaction.datastore;
    var query = datastore.createQuery('Task');

    testUtil.deleteEntities(datastore, query, done);
  });

  describe('update', function() {
    it('performs a transactional update', function(done) {
      transaction.testTransactionalUpdate(done);
    });
  });

  describe('retry', function() {
    it('performs retries if necessary', function(done) {
      transaction.testTransactionalRetry(done);
    });
  });

  describe('getOrCreate', function() {
    it('performs a get or create', function(done) {
      transaction.testTransactionalGetOrCreate(done);
    });
  });

  describe('single entity group read only', function() {
    it('gets a snapshot of task list entities', function(done) {
      transaction.testSingleEntityGroupReadOnly(done);
    });
  });
});
