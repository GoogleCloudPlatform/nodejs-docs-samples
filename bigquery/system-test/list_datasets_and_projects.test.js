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

var example = require('../list_datasets_and_projects');
sinon.stub(example, 'printUsage');
sinon.stub(example, 'listDatasets');
sinon.stub(example, 'listProjects');

describe('bigquery:list_datasets_and_projects', function () {
  describe('main', function () {
    it('should list datasets via the command line', function () {
      example.main(
        ['list-datasets', 'googledata'],
        function (err, datasets) {
          assert.ifError(err);
          assert(example.listProjects.calledWith('googledata'));
          assert.notNull(datasets);
          assert(Array.isArray(datasets));
          assert(datasets.length > 0);
          assert(console.log.calledWith(datasets));
        });
    });

    it('should require a project ID when listing datasets', function () {
      example.main(
        ['list-datasets'],
        function (err) {
          assert.ifError(err);
          assert.equal(example.listDatasets.called, false);
          assert(example.printUsage.called);
        });
    });

    it('should list projects via the command line', function () {
      example.main(
        ['list-projects'],
        function (err, projects) {
          assert.ifError(err);
          assert(example.listProjects.called);
          assert.notNull(projects);
          assert(Array.isArray(projects));
          assert(projects.length > 0);
          assert(console.log.calledWith(projects));
        }
      );
    });
  });
});
