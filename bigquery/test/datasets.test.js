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
var datasetId = 'foo';
var projectId = process.env.GCLOUD_PROJECT;

function getSample () {
  var tableMock = {
    get: sinon.stub(),
    metadata: {
      numBytes: 1000000
    }
  };
  tableMock.get.yields(null, tableMock);
  var tablesMock = [tableMock];
  var datasetsMock = [{ id: datasetId }];
  var datasetMock = {
    getTables: sinon.stub().yields(null, tablesMock),
    create: sinon.stub().yields(null, datasetsMock[0]),
    delete: sinon.stub().yields(null)
  };
  var bigqueryMock = {
    getDatasets: sinon.stub().yields(null, datasetsMock),
    dataset: sinon.stub().returns(datasetMock)
  };
  var BigQueryMock = sinon.stub().returns(bigqueryMock);

  return {
    program: proxyquire('../datasets', {
      '@google-cloud/bigquery': BigQueryMock
    }),
    mocks: {
      BigQuery: BigQueryMock,
      bigquery: bigqueryMock,
      datasets: datasetsMock,
      dataset: datasetMock,
      tables: tablesMock,
      table: tableMock
    }
  };
}

describe('bigquery:datasets', function () {
  describe('createDataset', function () {
    it('should create a dataset', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.createDataset(datasetId, callback);

      assert.equal(sample.mocks.dataset.create.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.create.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.datasets[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created dataset: %s', datasetId]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.create.yields(error);

      sample.program.createDataset(datasetId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('deleteDataset', function () {
    it('should delete a dataset', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.deleteDataset(datasetId, callback);

      assert.equal(sample.mocks.dataset.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.delete.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted dataset: %s', datasetId]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.delete.yields(error);

      sample.program.deleteDataset(datasetId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listDatasets', function () {
    it('should list datasets', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listDatasets(projectId, callback);

      assert.equal(sample.mocks.bigquery.getDatasets.calledOnce, true);
      assert.deepEqual(sample.mocks.bigquery.getDatasets.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.datasets]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d dataset(s)!', sample.mocks.datasets.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.bigquery.getDatasets.yields(error);

      sample.program.listDatasets(projectId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('getDatasetSize', function () {
    it('should calculate size of a dataset', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.getDatasetSize(datasetId, projectId, callback);

      assert.equal(sample.mocks.dataset.getTables.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.getTables.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, 1]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Size of %s: %d MB', datasetId, 1]);
    });

    it('should handle dataset.getTables error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.getTables.yields(error);

      sample.program.getDatasetSize(datasetId, projectId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });

    it('should handle table.get error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.get.yields(error);

      sample.program.getDatasetSize(datasetId, projectId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call createDataset', function () {
      var program = getSample().program;

      sinon.stub(program, 'createDataset');
      program.main(['create', datasetId]);
      assert.equal(program.createDataset.calledOnce, true);
      assert.deepEqual(program.createDataset.firstCall.args.slice(0, -1), [datasetId]);
    });

    it('should call deleteDataset', function () {
      var program = getSample().program;

      sinon.stub(program, 'deleteDataset');
      program.main(['delete', datasetId]);
      assert.equal(program.deleteDataset.calledOnce, true);
      assert.deepEqual(program.deleteDataset.firstCall.args.slice(0, -1), [datasetId]);
    });

    it('should call listDatasets', function () {
      var program = getSample().program;

      sinon.stub(program, 'listDatasets');
      program.main(['list']);
      assert.equal(program.listDatasets.calledOnce, true);
      assert.deepEqual(program.listDatasets.firstCall.args.slice(0, -1), [projectId]);
    });

    it('should call getDatasetSize', function () {
      var program = getSample().program;

      sinon.stub(program, 'getDatasetSize');
      program.main(['size', datasetId]);
      assert.equal(program.getDatasetSize.calledOnce, true);
      assert.deepEqual(program.getDatasetSize.firstCall.args.slice(0, -1), [datasetId, projectId]);
    });
  });
});
