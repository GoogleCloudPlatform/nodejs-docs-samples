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

var Metadata = require('../../datastore/concepts').Metadata;
var metadata;

describe('datastore/concepts/metadata', function () {
  before(function() {
    var projectId = process.env.GCLOUD_PROJECT || 'nodejs-docs-samples';
    metadata = new Metadata(projectId);
  });

  after(function(done) {
    var datastore = metadata.datastore;
    var query = datastore.createQuery('Task');

    testUtil.deleteEntities(datastore, query, done);
  });

  describe('namespace query', function() {
    it('performs a namespace query', function(done) {
      metadata.testNamespaceRunQuery(done);
    });
  });

  describe('kinds query', function() {
    it('performs a kind query', function(done) {
      metadata.testKindRunQuery(done);
    });
  });

  describe('property query', function() {
    it('performs a property query', function(done) {
      metadata.testPropertyRunQuery(done);
    });
  });

  describe('property by kind query', function() {
    it('performs a property by kind query', function(done) {
      metadata.testPropertyByKindRunQuery(done);
    });
  });
});
