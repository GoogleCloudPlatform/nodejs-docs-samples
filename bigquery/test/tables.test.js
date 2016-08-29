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
var bucket = 'bucket';
var file = 'file';
var job = 'job';
var dataset = 'dataset';
var table = 'table';
var format = 'JSON';
var schema = 'schema';

function getSample () {
  var tableMocks = [
    {
      id: table
    }
  ];
  var bucketMock = {
    file: sinon.stub().returns(fileMock)
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var fileMock = {};
  var metadataMock = { status: { state: 'DONE' } };
  var jobMock = {
    id: job,
    getMetadata: sinon.stub().yields(null, metadataMock),
    on: sinon.stub().returnsThis()
  };
  var tableMock = {
    export: sinon.stub().yields(null, jobMock),
    delete: sinon.stub().yields(null),
    import: sinon.stub().yields(null, jobMock)
  };
  var datasetMock = {
    table: sinon.stub().returns(tableMock),
    createTable: sinon.stub().yields(null, tableMocks[0]),
    getTables: sinon.stub().yields(null, tableMocks)
  };
  var bigqueryMock = {
    job: sinon.stub().returns(jobMock),
    dataset: sinon.stub().returns(datasetMock)
  };
  var BigQueryMock = sinon.stub().returns(bigqueryMock);
  var StorageMock = sinon.stub().returns(storageMock);

  return {
    program: proxyquire('../tables', {
      '@google-cloud/bigquery': BigQueryMock,
      '@google-cloud/storage': StorageMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      BigQuery: BigQueryMock,
      bigquery: bigqueryMock,
      Storage: StorageMock,
      storage: storageMock,
      metadata: metadataMock,
      job: jobMock,
      table: tableMock,
      bucket: bucketMock,
      dataset: datasetMock,
      tables: tableMocks
    }
  };
}

describe('bigquery:tables', function () {
  describe('createTable', function () {
    it('should create a table', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset,
        table: table
      };

      sample.program.createTable(options, callback);

      assert.equal(sample.mocks.dataset.createTable.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.createTable.firstCall.args.slice(0, -1), [options.table, {}]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.tables[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created table: %s', options.table]);
    });

    it('should create a table with a schema', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset,
        table: table,
        schema: schema
      };

      sample.program.createTable(options, callback);

      assert.equal(sample.mocks.dataset.createTable.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.createTable.firstCall.args.slice(0, -1), [options.table, { schema: schema }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.tables[0]]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created table: %s', options.table]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.createTable.yields(error);

      sample.program.createTable({}, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listTables', function () {
    it('should list tables', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset
      };

      sample.program.listTables(options, callback);

      assert.equal(sample.mocks.dataset.getTables.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.getTables.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.tables]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d table(s)!', sample.mocks.tables.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.getTables.yields(error);

      sample.program.listTables({}, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('deleteTable', function () {
    it('should delete a table', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset,
        table: table
      };

      sample.program.deleteTable(options, callback);

      assert.equal(sample.mocks.table.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.table.delete.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted table: %s', options.table]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.delete.yields(error);

      sample.program.deleteTable({}, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('importFile', function () {
    it('should import a local file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset,
        table: table,
        file: file
      };
      sample.mocks.job.on.withArgs('complete').yields(sample.mocks.metadata);

      sample.program.importFile(options, callback);

      assert.equal(sample.mocks.table.import.calledOnce, true);
      assert.deepEqual(sample.mocks.table.import.firstCall.args.slice(0, -1), [options.file, { format: undefined }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should import a GCS file', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var options = {
        dataset: dataset,
        table: table,
        file: file,
        bucket: bucket,
        format: format
      };
      sample.mocks.job.on.withArgs('complete').yields(sample.mocks.metadata);

      sample.program.importFile(options, callback);

      assert.equal(sample.mocks.table.import.calledOnce, true);
      assert.deepEqual(sample.mocks.table.import.firstCall.args.slice(0, -1), [sample.mocks.file, { format: format }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.import.yields(error);

      sample.program.importFile({}, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('exportTableToGCS', function () {
    it('should export to a table', function () {
      var sample = getSample();
      var options = {
        bucket: bucket,
        file: file,
        dataset: dataset,
        table: table,
        format: format,
        gzip: true
      };
      var callback = sinon.stub();
      sample.mocks.job.on.withArgs('complete').yields(sample.mocks.metadata);

      sample.program.exportTableToGCS(options, callback);

      assert.equal(sample.mocks.table.export.calledOnce, true);
      assert.deepEqual(sample.mocks.table.export.firstCall.args.slice(0, -1), [sample.mocks.file, { format: format, gzip: true }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle export error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.table.export.yields(error);
      example.program.exportTableToGCS({ format: format }, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.equal(callback.firstCall.args[0], error, 'callback received error');
    });
  });

  describe('main', function () {
    it('should call createTable', function () {
      var program = getSample().program;
      program.createTable = sinon.stub();

      program.main(['create', dataset, table]);
      assert.equal(program.createTable.calledOnce, true);
      assert.deepEqual(program.createTable.firstCall.args.slice(0, -1), [{ dataset: dataset, table: table }]);
    });

    it('should call listTables', function () {
      var program = getSample().program;
      program.listTables = sinon.stub();

      program.main(['list', dataset]);
      assert.equal(program.listTables.calledOnce, true);
      assert.deepEqual(program.listTables.firstCall.args.slice(0, -1), [{ dataset: dataset }]);
    });

    it('should call deleteTable', function () {
      var program = getSample().program;
      program.deleteTable = sinon.stub();

      program.main(['delete', dataset, table]);
      assert.equal(program.deleteTable.calledOnce, true);
      assert.deepEqual(program.deleteTable.firstCall.args.slice(0, -1), [{ dataset: dataset, table: table }]);
    });

    it('should call importFile', function () {
      var program = getSample().program;
      program.importFile = sinon.stub();

      program.main(['import', dataset, table, file]);
      assert.equal(program.importFile.calledOnce, true);
      assert.deepEqual(program.importFile.firstCall.args.slice(0, -1), [{
        dataset: dataset,
        table: table,
        file: file,
        bucket: undefined,
        format: undefined
      }]);
    });

    it('should call exportTableToGCS', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', dataset, table, bucket, file]);
      assert.equal(program.exportTableToGCS.calledOnce, true);
      assert.deepEqual(program.exportTableToGCS.firstCall.args.slice(0, -1), [{
        dataset: dataset,
        table: table,
        file: file,
        bucket: bucket,
        format: undefined,
        gzip: false
      }]);
    });

    it('should recognize --gzip flag', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', dataset, table, bucket, file, '--gzip']);
      assert.equal(program.exportTableToGCS.calledOnce, true);
      assert.deepEqual(program.exportTableToGCS.firstCall.args.slice(0, -1), [{
        dataset: dataset,
        table: table,
        file: file,
        bucket: bucket,
        format: undefined,
        gzip: true
      }]);
    });

    it('should recognize --format flag', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', dataset, table, bucket, file, '--format', 'CSV']);
      assert.equal(program.exportTableToGCS.calledOnce, true);
      assert.deepEqual(program.exportTableToGCS.firstCall.args.slice(0, -1), [{
        dataset: dataset,
        table: table,
        file: file,
        bucket: bucket,
        format: 'CSV',
        gzip: false
      }]);
    });
  });
});
