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

var Index = require('../../datastore/concepts').Index;
var index;

describe('datastore/concepts/indexes', function () {
  before(function() {
    var projectId = process.env.TEST_PROJECT_ID || 'nodejs-docs-samples';
    index = new Index(projectId);
  });

  describe('unindexed properties', function() {
    it('performs a query with a filter on an unindexed property',
      function(done) {
        index.testUnindexedPropertyQuery(done);
      }
    );
  });

  describe('exploding properties', function() {
    it('inserts arrays of data', function(done) {
      index.testExplodingProperties(done);
    });
  });
});
