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

var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var datasetsMock = [
    {
      id: 'foo'
    }
  ];
  var projectsMock = [
    {
      id: 'bar'
    }
  ];
  var bigqueryMock = {
    getDatasets: sinon.stub().callsArgWith(0, null, datasetsMock)
  };
  var resourceMock = {
    getProjects: sinon.stub().callsArgWith(0, null, projectsMock)
  };
  var gcloudMock = {
    bigquery: sinon.stub().returns(bigqueryMock),
    resource: sinon.stub().returns(resourceMock)
  };
  return {
    program: proxyquire('../list_datasets_and_projects', {
      gcloud: gcloudMock
    }),
    mocks: {
      gcloud: gcloudMock,
      bigquery: bigqueryMock,
      resource: resourceMock,
      datasets: datasetsMock,
      projects: projectsMock
    }
  };
}

describe('bigquery:list_datasets_and_projects', function () {
  describe('main', function () {
    it('should show usage if no arguments exist', function () {
      var program = getSample().program;

      sinon.stub(program, 'printUsage');
      program.main([]);
      assert(program.printUsage.calledOnce);
    });
    it('should show usage if first argument is -h', function () {
      var program = getSample().program;

      sinon.stub(program, 'printUsage');
      program.main(['-h']);
      assert(program.printUsage.calledOnce);

      program.main(['--help']);
      assert(program.printUsage.calledTwice);
    });
    it('should call correct commands', function () {
      var program = getSample().program;

      sinon.stub(program, 'listDatasets');
      program.main(['list-datasets']);
      assert(program.listDatasets.calledOnce);

      sinon.stub(program, 'listProjects');
      program.main(['list-projects']);
      assert(program.listProjects.calledOnce);
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      var example = getSample();
      example.program.printUsage();
      assert(console.log.calledWith('Usage: node list_datasets_and_projects [COMMAND] [ARGS...]'));
      assert(console.log.calledWith('\nCommands:\n'));
      assert(console.log.calledWith('\tlist-datasets PROJECT_ID'));
      assert(console.log.calledWith('\tlist-projects'));
    });
  });

  describe('listProjects', function () {
    it('should list projects', function () {
      var example = getSample();
      example.program.listProjects(function (err, projects) {
        assert.ifError(err);
        assert.strictEqual(projects, example.mocks.projects);
        assert(console.log.calledWith('Found %d projects!', projects.length));
      });
    });
    it('should handle error', function () {
      var error = 'listProjectsError';
      var example = getSample();
      example.mocks.resource.getProjects = sinon.stub().callsArgWith(0, error);
      example.program.listProjects(function (err, projects) {
        assert.equal(err, error);
        assert.equal(projects, undefined);
      });
    });
  });

  describe('listDatasets', function () {
    it('should list datasets', function () {
      var example = getSample();
      example.program.listDatasets('googledata', function (err, datasets) {
        assert.ifError(err);
        assert.strictEqual(datasets, example.mocks.datasets);
        assert(console.log.calledWith('Found %d datasets!', datasets.length));
      });
    });
    it('should require a Project ID', function () {
      var example = getSample();
      example.program.listDatasets(undefined, function (err) {
        assert(err);
        assert.equal(err.message, 'projectId is required!');
      });
    });
    it('should handle error', function () {
      var error = 'listDatasetsError';
      var example = getSample();
      example.mocks.bigquery.getDatasets = sinon.stub().callsArgWith(0, error);
      example.program.listDatasets('googledata', function (err, datasets) {
        assert.equal(err, error);
        assert.equal(datasets, undefined);
      });
    });
  });
});
