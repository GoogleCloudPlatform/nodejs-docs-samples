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
sinon.spy(example, 'printUsage');

describe('bigquery:list_datasets_and_projects', function () {
  describe('main', function () {
    it('should show usage if no arguments exist', function () {
      example.main([],
        function (err) {
          assert.ifError(err);
          assert(example.printUsage.called);
        }
      );
    });

    it('should show usage if first argument is -h', function () {
      example.main(['-h'],
        function (err) {
          assert.ifError(err);
          assert(example.printUsage.called);
        }
      );
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      example.printUsage();
      assert(console.log.calledWith('Usage: node list_datasets_and_projects.js COMMAND [ARGS]'));
      assert(console.log.calledWith('\nCommands:'));
      assert(console.log.calledWith('\tlist-datasets PROJECT_ID'));
      assert(console.log.calledWith('\tlist-projects'));
    });
  });

  describe('listProjects', function () {
    it('should list projects', function () {
      example.listProjects(
        function (err, projects) {
          assert.ifError(err);
          assert.notNull(projects);
          assert(Array.isArray(projects));
          assert(projects.length > 0);
        });
    });
  });

  describe('listDatasets', function () {
    it('should list datasets', function () {
      example.listDatasets('googledata',
        function (err, datasets) {
          assert.ifError(err);
          assert.notNull(datasets);
          assert(Array.isArray(datasets));
          assert(datasets.length > 0);
        });
    });

    it('should require a Project ID', function () {
      assert.throws(
        function () {
          example.listDatasets(null, null);
        },
        Error,
        'projectId is required'
      );
    });
  });
});
