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
var projectId = process.env.GCLOUD_PROJECT || 'nodejs-docs-samples';

describe('bigquery:list_datasets_and_projects', function () {
  describe('listDatasets', function () {
    it('should list datasets', function (done) {
      example.listDatasets(projectId, function (err, datasets) {
        assert.ifError(err);
        assert(Array.isArray(datasets));
        assert(datasets.length > 0);
        assert(datasets[0].id);
        assert(console.log.calledWith('Found %d datasets!', datasets.length));
        done();
      });
    });
  });
  describe('listProjects', function () {
    it('should list projects', function (done) {
      example.listProjects(function (err, projects) {
        assert.ifError(err);
        assert(Array.isArray(projects));
        assert(projects.length > 0);
        assert(projects[0].id);
        assert(console.log.calledWith('Found %d projects!', projects.length));
        done();
      });
    });
  });
});
