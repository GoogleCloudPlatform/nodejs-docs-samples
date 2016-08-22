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
  var bucketMock = {
    file: sinon.stub().returns(fileMock)
  };

  var storageMock = {
    bucket: sinon.stub().returns(bucketMock)
  };

  var fileMock = {};

  var metadataMock = { status: { state: 'DONE' } };

  var jobId = 'abc';

  var jobMock = {
    id: jobId,
    getMetadata: sinon.stub().callsArgWith(0, null, metadataMock)
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
    },
    jobId: jobId
  };
}

describe('bigquery:tables', function () {
  describe('exportTable', function () {
    it('should export to a table', function () {
      var example = getSample();
      var options = {
        bucket: 'bucket',
        file: 'file',
        dataset: 'dataset',
        table: 'table',
        format: 'JSON',
        gzip: true
      };

      var callback = sinon.stub();
      example.program.exportTableToGCS(options, callback);

      assert(example.mocks.storage.bucket.calledWith(options.bucket), 'bucket found');
      assert(example.mocks.bucket.file.calledWith(options.file), 'file found');
      assert(example.mocks.bigquery.dataset.calledWith(options.dataset), 'dataset found');
      assert(example.mocks.dataset.table.calledWith(options.table), 'table found');
      assert(example.mocks.table.export.calledOnce, 'table.export called once');

      assert(console.log.calledWith('ExportTableToGCS: submitted job %s!', example.mocks.job.id),
        'job submittal was reported'
      );

      assert.equal(callback.firstCall.args.length, 2, 'callback has 2 arguments');
      assert.ifError(callback.firstCall.args[0], 'callback did not receive error');
      assert.equal(callback.firstCall.args[1], example.mocks.job, 'callback received job');
    });

    it('should handle error', function () {
      var error = new Error('exportTableToGCSError');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.table.export = sinon.stub().callsArgWith(2, error);
      example.program.exportTableToGCS({ format: 'JSON' }, callback);

      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.equal(callback.firstCall.args[0], error, 'callback received error');
    });
  });

  describe('pollExportJob', function () {
    it('should fetch and report the status of a job', function () {
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.job = sinon.stub().returns(example.mocks.job);
      example.program.pollExportJob(example.jobId, callback);

      assert(example.mocks.bigquery.job.calledOnce, 'job called once');
      assert(example.mocks.job.getMetadata.calledOnce, 'getMetadata called once');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 2, 'callback received 2 arguments');
      assert.equal(callback.firstCall.args[0], null, 'callback did not receive error');
      assert.deepEqual(callback.firstCall.args[1], example.mocks.metadata,
        'callback received metadata'
      );

      assert(
        console.log.calledWith('PollExportJob: job status: %s', example.mocks.metadata.status.state),
        'job status was reported'
      );
    });

    it('should error if a job is not finished', function () {
      var example = getSample();
      var callback = sinon.stub();

      var pendingState = { status: { state: 'PENDING' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, pendingState);
      example.program.pollExportJob(example.jobId, callback);

      assert(example.mocks.bigquery.job.calledOnce, 'bigquery.job called once');
      assert(example.mocks.job.getMetadata.calledOnce, 'getMetadata called once');
      assert(callback.calledOnce, 'callback called once');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.deepEqual(callback.firstCall.args[0], new Error('Job %s is not done'),
        'callback received error'
      );

      assert(console.log.calledWith('PollExportJob: job status: %s', pendingState.status.state),
        'job status was reported'
      );

      var doneState = { status: { state: 'DONE' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, doneState);
      example.program.pollExportJob(example.jobId, callback);

      assert(example.mocks.bigquery.job.calledTwice, 'bigquery.job called a second time');
      assert(example.mocks.job.getMetadata.calledOnce, 'new getMetadata called once');
      assert(callback.calledTwice, 'callback called a second time');

      assert.equal(callback.secondCall.args.length, 2, 'callback received 2 arguments');
      assert.ifError(callback.secondCall.args[0], 'callback did not receive error');
      assert.deepEqual(callback.secondCall.args[1], example.mocks.metadata,
        'callback received metadata'
      );

      assert(console.log.calledWith('PollExportJob: job status: %s', doneState.status.state),
        'job status was reported'
      );
    });

    it('should handle error', function () {
      var error = new Error('pollExportJobError');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, error);
      example.program.pollExportJob(example.jobId, callback);

      assert(example.mocks.bigquery.job.calledOnce, 'bigquery.job called once');
      assert(example.mocks.job.getMetadata.calledOnce, 'getMetadata called once');
      assert(callback.calledOnce, 'callback called');
      assert.equal(callback.firstCall.args.length, 1, 'callback received 1 argument');
      assert.equal(callback.firstCall.args[0], error, 'callback received error');
    });
  });

  describe('main', function () {
    it('should call exportTableToGCS', function () {
      var program = getSample().program;
      program.exportTableToGCS = sinon.stub();

      program.main(['export', 'bucket', 'file', 'dataset', 'table', 'JSON']);
      assert(program.exportTableToGCS.calledOnce);
    });

    it('should call pollExportJob', function () {
      var program = getSample().program;
      program.pollExportJob = sinon.stub();
      var jobId = 'ABCDE';

      program.main(['poll', jobId]);
      assert(program.pollExportJob.calledWith(jobId));
    });
  });
});
