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

var Entity = require('../../datastore/concepts').Entity;
var entity;

describe('datastore/concepts/entity', function () {
  before(function() {
    var projectId = process.env.GCLOUD_PROJECT || 'nodejs-docs-samples';
    entity = new Entity(projectId);
  });

  after(function(done) {
    var datastore = entity.datastore;
    var query = datastore.createQuery('Task');

    testUtil.deleteEntities(datastore, query, done);
  });

  describe('incomplete key', function() {
    it('saves with an incomplete key', function(done) {
      entity.testIncompleteKey(done);
    });
  });

  describe('testNamedKey', function() {
    it('saves with a named key', function(done) {
      entity.testNamedKey(done);
    });
  });

  describe('testKeyWithParent', function() {
    it('saves a key with a parent', function(done) {
      entity.testKeyWithParent(done);
    });
  });

  describe('testKeyWithMultiLevelParent', function() {
    it('saves a key with multiple parents', function(done) {
      entity.testKeyWithMultiLevelParent(done);
    });
  });

  describe('testEntityWithParent', function() {
    it('saves an entity with a parent', function(done) {
      entity.testEntityWithParent(done);
    });
  });

  describe('testProperties', function() {
    it('saves an entity with properties', function(done) {
      entity.testProperties(done);
    });
  });

  describe('testArrayValue', function() {
    it('saves an entity with arrays', function(done) {
      entity.testArrayValue(done);
    });
  });

  describe('testBasicEntity', function() {
    it('saves a basic entity', function(done) {
      entity.testBasicEntity(done);
    });
  });

  describe('testUpsert', function() {
    it('saves with an upsert', function(done) {
      entity.testUpsert(done);
    });
  });

  describe('testInsert', function() {
    it('saves with an insert', function(done) {
      entity.testInsert(done);
    });
  });

  describe('testLookup', function() {
    it('performs a lookup', function(done) {
      entity.testLookup(done);
    });
  });

  describe('testUpdate', function() {
    it('saves with an update', function(done) {
      entity.testUpdate(done);
    });
  });

  describe('testDelete', function() {
    it('deletes an entity', function(done) {
      entity.testDelete(done);
    });
  });

  describe('testBatchUpsert', function() {
    it('performs a batch upsert', function(done) {
      entity.testBatchUpsert(done);
    });
  });

  describe('testBatchLookup', function() {
    it('performs a batch lookup', function(done) {
      entity.testBatchLookup(done);
    });
  });

  describe('testBatchDelete', function() {
    it('performs a batch delete', function(done) {
      entity.testBatchDelete(done);
    });
  });
});
