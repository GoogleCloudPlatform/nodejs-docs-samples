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
var bucketName = 'bucket';
var fileName = 'file';
var jobId = 'job';
var datasetId = 'dataset';
var tableId = 'table';
var srcDatasetId = datasetId;
var srcTableId = tableId;
var destDatasetId = datasetId + '_dest';
var destTableId = tableId + '_dest';
var schema = 'schema';
var jsonArray = [
  { name: 'foo', age: 27 },
  { name: 'bar', age: 13 }
];
var validJsonFile = 'validJsonFile';
var invalidJsonFile = 'invalidJsonFile';
var validJsonString = JSON.stringify(jsonArray);
var invalidJsonString = 'INVALID';
var errorList = ['error 1', 'error 2'];

function getSample () {
  var apiResponseMock = {};
  var tableMocks = [
    {
      id: tableId
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
    id: jobId,
    getMetadata: sinon.stub().yields(null, metadataMock),
    on: sinon.stub().returnsThis()
  };
  jobMock.on.withArgs('complete').yields(metadataMock);
  var tableMock = {
    export: sinon.stub().yields(null, jobMock, apiResponseMock),
    copy: sinon.stub().yields(null, jobMock, apiResponseMock),
    import: sinon.stub().yields(null, jobMock, apiResponseMock),
    insert: sinon.stub().yields(null, errorList, apiResponseMock),
    getRows: sinon.stub().yields(null, jsonArray),
    delete: sinon.stub().yields(null)
  };
  var datasetMock = {
    table: sinon.stub().returns(tableMock),
    createTable: sinon.stub().yields(null, tableMocks[0], apiResponseMock),
    getTables: sinon.stub().yields(null, tableMocks)
  };
  var bigqueryMock = {
    job: sinon.stub().returns(jobMock),
    dataset: sinon.stub().returns(datasetMock)
  };
  var BigQueryMock = sinon.stub().returns(bigqueryMock);
  var StorageMock = sinon.stub().returns(storageMock);
  var fsMock = {
    readFileSync: sinon.stub().throws(new Error('Invalid file.'))
  };
  fsMock.readFileSync.withArgs(validJsonFile).returns(validJsonString);
  fsMock.readFileSync.withArgs(invalidJsonFile).returns(invalidJsonString);

  return {
    program: proxyquire('../tables', {
      '@google-cloud/bigquery': BigQueryMock,
      '@google-cloud/storage': StorageMock,
      'fs': fsMock,
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
      fs: fsMock,
      tables: tableMocks,
      apiResponse: apiResponseMock
    }
  };
}

describe('bigquery:tables', function () {
  describe('createTable', function () {
    it('should create a table', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.createTable(datasetId, tableId, undefined, callback);

      assert.equal(sample.mocks.dataset.createTable.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.createTable.firstCall.args.slice(0, -1), [tableId, { schema: undefined }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.tables[0], sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created table %s in %s', tableId, datasetId]);
    });

    it('should create a table with a schema', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.createTable(datasetId, tableId, schema, callback);

      assert.equal(sample.mocks.dataset.createTable.calledOnce, true);
      assert.deepEqual(sample.mocks.dataset.createTable.firstCall.args.slice(0, -1), [tableId, { schema: schema }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.tables[0], sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Created table %s in %s', tableId, datasetId]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.dataset.createTable.yields(error);

      sample.program.createTable(datasetId, tableId, undefined, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('listTables', function () {
    it('should list tables', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listTables(datasetId, callback);

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

  describe('browseRows', function () {
    it('should display rows', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.browseRows(datasetId, tableId, callback);

      assert.equal(sample.mocks.table.getRows.calledOnce, true);
      assert.deepEqual(sample.mocks.table.getRows.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, jsonArray]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d row(s)!', jsonArray.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.getRows.yields(error);

      sample.program.browseRows(datasetId, tableId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('deleteTable', function () {
    it('should delete a table', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.deleteTable(datasetId, tableId, callback);

      assert.equal(sample.mocks.table.delete.calledOnce, true);
      assert.deepEqual(sample.mocks.table.delete.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Deleted table %s from %s', tableId, datasetId]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.delete.yields(error);

      sample.program.deleteTable(datasetId, tableId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('importLocalFile', function () {
    it('should import a local file', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.importLocalFile(datasetId, tableId, fileName, callback);

      assert.equal(sample.mocks.table.import.calledOnce, true);
      assert.deepEqual(sample.mocks.table.import.firstCall.args.slice(0, -1), [fileName]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata, sample.mocks.apiResponse]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.import.yields(error);

      sample.program.importLocalFile(datasetId, tableId, fileName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('importFileFromGCS', function () {
    it('should import a GCS file', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.importFileFromGCS(datasetId, tableId, bucketName, fileName, callback);

      assert.equal(sample.mocks.table.import.calledOnce, true);
      assert.deepEqual(sample.mocks.table.import.firstCall.args.slice(0, -1), [sample.mocks.file]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata, sample.mocks.apiResponse]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.import.yields(error);

      sample.program.importFileFromGCS(datasetId, tableId, bucketName, fileName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('copyTable', function () {
    it('should copy a table', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.copyTable(srcDatasetId, srcTableId, destDatasetId, destTableId, callback);

      assert.equal(sample.mocks.table.copy.calledOnce, true);
      assert.deepEqual(
        sample.mocks.table.copy.firstCall.args.slice(0, -1),
        [sample.mocks.table]
      );
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata, sample.mocks.apiResponse]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.copy.yields(error);

      sample.program.copyTable(srcDatasetId, srcTableId, destDatasetId, destTableId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('exportTableToGCS', function () {
    it('should export to a table', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.exportTableToGCS(datasetId, tableId, bucketName, fileName, callback);

      assert.equal(sample.mocks.table.export.calledOnce, true);
      assert.deepEqual(sample.mocks.table.export.firstCall.args.slice(0, -1), [sample.mocks.file]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.metadata, sample.mocks.apiResponse]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', sample.mocks.job.id]);
      assert.deepEqual(console.log.secondCall.args, ['Completed job: %s', sample.mocks.job.id]);
    });

    it('should handle export error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.table.export.yields(error);

      example.program.exportTableToGCS(datasetId, tableId, bucketName, fileName, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('insertRowsAsStream', function () {
    it('should stream-insert rows into a table', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.insertRowsAsStream(datasetId, tableId, jsonArray, callback);

      assert.equal(sample.mocks.table.insert.calledOnce, true);
      assert.deepEqual(sample.mocks.table.insert.firstCall.args.slice(0, -1), [jsonArray]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, errorList, sample.mocks.apiResponse]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Inserted %d row(s)!', jsonArray.length]);
    });

    it('should handle API errors', function () {
      var sample = getSample();
      var callback = sinon.stub();
      var error = new Error('error');
      sample.mocks.table.insert.yields(error);

      sample.program.insertRowsAsStream(datasetId, tableId, jsonArray, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });

    it('should handle (per-row) insert errors', function () {
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.table.insert.yields(null, errorList, sample.mocks.apiResponse);

      sample.program.insertRowsAsStream(datasetId, tableId, jsonArray, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, errorList, sample.mocks.apiResponse]);
    });
  });

  describe('main', function () {
    it('should call createTable', function () {
      var program = getSample().program;
      program.createTable = sinon.stub();

      program.main(['create', datasetId, tableId]);
      assert.equal(program.createTable.calledOnce, true);
      assert.deepEqual(program.createTable.firstCall.args.slice(0, -1), [datasetId, tableId]);
    });

    it('should call listTables', function () {
      var program = getSample().program;
      program.listTables = sinon.stub();

      program.main(['list', datasetId]);
      assert.equal(program.listTables.calledOnce, true);
      assert.deepEqual(program.listTables.firstCall.args.slice(0, -1), [datasetId]);
    });

    it('should call browseRows', function () {
      var program = getSample().program;
      program.browseRows = sinon.stub();

      program.main(['browse', datasetId, tableId]);
      assert.equal(program.browseRows.calledOnce, true);
      assert.deepEqual(program.browseRows.firstCall.args.slice(0, -1), [datasetId, tableId]);
    });

    it('should call deleteTable', function () {
      var program = getSample().program;
      program.deleteTable = sinon.stub();

      program.main(['delete', datasetId, tableId]);
      assert.equal(program.deleteTable.calledOnce, true);
      assert.deepEqual(program.deleteTable.firstCall.args.slice(0, -1), [datasetId, tableId]);
    });

    it('should call importLocalFile', function () {
      var program = getSample().program;
      program.importLocalFile = sinon.stub();

      program.main(['import', datasetId, tableId, fileName]);
      assert.equal(program.importLocalFile.calledOnce, true);
      assert.deepEqual(program.importLocalFile.firstCall.args.slice(0, -1), [datasetId, tableId, fileName]);
    });

    it('should call importFileFromGCS', function () {
      var program = getSample().program;
      program.importFileFromGCS = sinon.stub();

      program.main(['import', datasetId, tableId, fileName, '-b', bucketName]);
      assert.equal(program.importFileFromGCS.calledOnce, true);
      assert.deepEqual(program.importFileFromGCS.firstCall.args.slice(0, -1), [datasetId, tableId, bucketName, fileName]);
    });

    it('should call copyTable', function () {
      var program = getSample().program;
      program.copyTable = sinon.stub();

      program.main(['copy', srcDatasetId, srcTableId, destDatasetId, destTableId]);
      assert.equal(program.copyTable.calledOnce, true);
      assert.deepEqual(program.copyTable.firstCall.args.slice(0, -1), [srcDatasetId, srcTableId, destDatasetId, destTableId]);
    });

    it('should call exportTableToGCS', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', datasetId, tableId, bucketName, fileName]);
      assert.equal(program.exportTableToGCS.calledOnce, true);
      assert.deepEqual(program.exportTableToGCS.firstCall.args.slice(0, -1), [datasetId, tableId, bucketName, fileName]);
    });

    it('should call insertRowsAsStream', function () {
      var program = getSample().program;
      program.insertRowsAsStream = sinon.stub();

      program.main(['insert', datasetId, tableId, validJsonFile]);

      assert.equal(program.insertRowsAsStream.calledOnce, true);
      assert.deepEqual(program.insertRowsAsStream.firstCall.args.slice(0, -1), [datasetId, tableId, jsonArray]);
    });

    describe('insert', function () {
      it('should accept valid JSON files', function () {
        var program = getSample().program;
        program.insertRowsAsStream = sinon.stub();

        program.main(['insert', datasetId, tableId, validJsonFile]);

        assert.equal(program.insertRowsAsStream.calledOnce, true);
        assert.deepEqual(program.insertRowsAsStream.firstCall.args.slice(0, -1), [datasetId, tableId, jsonArray]);
      });

      it('should reject files with invalid JSON', function () {
        var program = getSample().program;
        program.insertRowsAsStream = sinon.stub();

        assert.throws(
          function () { program.main(['insert', datasetId, tableId, invalidJsonFile]); },
          /"json_or_file" \(or the file it points to\) is not a valid JSON array\./
        );
        assert.equal(program.insertRowsAsStream.called, false);
      });

      it('should reject invalid file names', function () {
        var program = getSample().program;
        program.insertRowsAsStream = sinon.stub();

        assert.throws(
          function () { program.main(['insert', datasetId, tableId, '']); },
          /"json_or_file" \(or the file it points to\) is not a valid JSON array\./
        );
        assert.equal(program.insertRowsAsStream.called, false);
      });

      it('should accept valid JSON strings', function () {
        var program = getSample().program;
        program.insertRowsAsStream = sinon.stub();

        program.main(['insert', datasetId, tableId, validJsonString]);
        assert.equal(program.insertRowsAsStream.calledOnce, true);
        assert.deepEqual(program.insertRowsAsStream.firstCall.args.slice(0, -1), [datasetId, tableId, jsonArray]);
      });

      it('should reject invalid JSON strings', function () {
        var program = getSample().program;
        program.insertRowsAsStream = sinon.stub();

        assert.throws(
          function () { program.main(['insert', datasetId, tableId, invalidJsonString]); },
          /"json_or_file" \(or the file it points to\) is not a valid JSON array\./
        );
        assert.equal(program.insertRowsAsStream.called, false);
      });
    });
  });
});
