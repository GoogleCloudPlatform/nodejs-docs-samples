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
var dataset = 'dataset';
var table = 'table';
var format = 'JSON';

function getSample () {
  var bucketMock = {
    file: sinon.stub().returns(fileMock)
  };
  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };
  var fileMock = {};
  var metadataMock = { status: { state: 'DONE' } };
  var jobMock = {
    getMetadata: sinon.stub().callsArgWith(0, null, metadataMock),
    on: sinon.stub()
  };
  var tableMock = {
    export: sinon.stub().callsArgWith(2, null, jobMock)
  };
  var datasetMock = {
    table: sinon.stub().returns(tableMock)
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
      dataset: datasetMock
    }
  };
}

describe('bigquery:tables', function () {
  describe('exportTable', function () {
    it('should export to a table', function () {
      var example = getSample();
      var options = {
        bucket: bucket,
        file: file,
        dataset: dataset,
        table: table,
        format: format,
        gzip: true
      };
      var callback = sinon.stub();
      example.mocks.job.on.withArgs('complete').callsArgWith(1, example.mocks.metadata);

      example.program.exportTableToGCS(options, callback);

      assert(example.mocks.storage.bucket.calledWith(options.bucket), 'bucket found');
      assert(example.mocks.bucket.file.calledWith(options.file), 'file found');
      assert(example.mocks.bigquery.dataset.calledWith(options.dataset), 'dataset found');
      assert(example.mocks.dataset.table.calledWith(options.table), 'table found');
      assert(example.mocks.table.export.calledOnce, 'table.export called once');
      assert(console.log.calledWith('ExportTableToGCS: submitted job %s!', example.mocks.job.id),
        'job submittal was reported'
      );

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.equal(callback.firstCall.args[1], example.mocks.metadata, 'callback received metadata');
    });

    it('should handle export error', function () {
      var error = new Error('exportTableToGCSError');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.table.export = sinon.stub().callsArgWith(2, error);
      example.program.exportTableToGCS({ format: format }, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.equal(callback.firstCall.args[0], error, 'callback received error');
    });

    it('should handle job-processing error', function () {
      var error = new Error('exportTableToGCSError');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.job.on.withArgs('error').callsArgWith(1, error);
      example.program.exportTableToGCS({ format: format }, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.equal(callback.firstCall.args[0], error, 'callback received error');
    });
  });

  describe('main', function () {
    it('should call exportTableToGCS', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', bucket, file, dataset, table, format]);
      assert(program.exportTableToGCS.calledOnce);
    });
  });
});
