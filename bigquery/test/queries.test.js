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
  var natalityMock = [
    { year: '2001' },
    { year: '2002' },
    { year: '2003' },
    { year: '2004' },
    { year: '2005' }
  ];

  var metadataMock = { status: { state: 'DONE' } };

  var jobId = 'abc';

  var jobMock = {
    id: jobId,
    getQueryResults: sinon.stub().callsArgWith(0, null, natalityMock),
    getMetadata: sinon.stub().callsArgWith(0, null, metadataMock)
  };

  var bigqueryMock = {
    job: sinon.stub().returns(jobMock),
    startQuery: sinon.stub().callsArgWith(1, null, jobMock),
    query: sinon.stub().callsArgWith(1, null, natalityMock)
  };

  var BigQueryMock = sinon.stub().returns(bigqueryMock);

  return {
    program: proxyquire('../queries', {
      '@google-cloud/bigquery': BigQueryMock
    }),
    mocks: {
      BigQuery: BigQueryMock,
      bigquery: bigqueryMock,
      natality: natalityMock,
      metadata: metadataMock,
      job: jobMock
    },
    jobId: jobId
  };
}

describe('bigquery:query', function () {
  describe('syncQuery', function () {
    var query = 'foo';

    it('should return results', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.syncQuery(query, callback);

      assert.ifError(callback.firstCall.args[0]);
      assert(example.mocks.bigquery.query.called);
      assert.deepEqual(callback.firstCall.args[1], example.mocks.natality);
      assert(console.log.calledWith(
        'SyncQuery: found %d rows!',
        callback.firstCall.args[1].length
      ));
    });

    it('should require a query', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.syncQuery(null, callback);

      assert.deepEqual(callback.firstCall.args[0], new Error('"query" is required!'));
      assert.equal(callback.firstCall.args[1], undefined);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.query = sinon.stub().callsArgWith(1, error);

      example.program.syncQuery(query, callback);

      assert.deepEqual(callback.firstCall.args[0], error);
      assert.equal(callback.firstCall.args[1], undefined);
    });
  });

  describe('asyncQuery', function () {
    var query = 'foo';

    it('should submit a job', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.asyncQuery(query, callback);

      assert.ifError(callback.firstCall.args[0]);
      assert(example.mocks.bigquery.startQuery.called);
      assert.deepEqual(callback.firstCall.args[1], example.mocks.job);
      assert(console.log.calledWith(
        'AsyncQuery: submitted job %s!', example.jobId
      ));
    });

    it('should require a query', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.asyncQuery(null, callback);

      assert.deepEqual(callback.firstCall.args[0], new Error('"query" is required!'));
      assert.equal(callback.firstCall.args[1], undefined);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.startQuery = sinon.stub().callsArgWith(1, error);

      example.program.asyncQuery(query, callback);

      assert.deepEqual(callback.firstCall.args[0], error);
      assert.equal(callback.firstCall.args[1], undefined);
    });
  });

  describe('asyncPoll', function () {
    it('should get the results of a job given its ID', function () {
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.job = sinon.stub().returns(example.mocks.job);

      example.program.asyncPoll(example.jobId, callback);

      assert.ifError(callback.firstCall.args[0]);
      assert(example.mocks.job.getQueryResults.called);
      assert(console.log.calledWith(
        'AsyncQuery: polled job %s; got %d rows!',
        example.jobId,
        example.mocks.natality.length
      ));
    });

    it('should report the status of a job', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.asyncPoll(example.jobId, callback);

      assert.ifError(callback.firstCall.args[0]);
      assert(example.mocks.job.getMetadata.called);
      assert(console.log.calledWith(
        'Job status: %s',
        example.mocks.metadata.status.state
      ));
    });

    it('should check whether a job is finished', function () {
      var example = getSample();
      var callback = sinon.stub();

      var pendingState = { status: { state: 'PENDING' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, pendingState);

      example.program.asyncPoll(example.jobId, callback);

      assert.deepEqual(callback.firstCall.args[0], Error('Job %s is not done', example.jobId));
      assert(console.log.calledWith('Job status: %s', pendingState.status.state));
      assert(example.mocks.job.getMetadata.called);
      assert.equal(example.mocks.job.getQueryResults.called, false);
      assert.equal(callback.firstCall.args[1], undefined);

      var doneState = { status: { state: 'DONE' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, doneState);

      example.program.asyncPoll(example.jobId, callback);

      assert.ifError(callback.secondCall.args[0]);
      assert(console.log.calledWith('Job status: %s', doneState.status.state));
      assert(example.mocks.job.getMetadata.called);
      assert(example.mocks.job.getQueryResults.called);
      assert.equal(callback.secondCall.args[1], example.mocks.natality);
    });

    it('should require a job ID', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.asyncPoll(null, callback);

      assert.deepEqual(callback.firstCall.args[0], Error('"jobId" is required!'));
      assert.equal(callback.firstCall.args[1], undefined);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.job.getQueryResults = sinon.stub().callsArgWith(0, error);

      example.program.asyncPoll(example.jobId, callback);

      assert.deepEqual(callback.firstCall.args[0], error);
      assert.equal(callback.firstCall.args[1], undefined);
    });
  });

  describe('main', function () {
    var query = 'foo';
    var jobId = 'foo';

    it('should call syncQuery', function () {
      var program = getSample().program;

      sinon.stub(program, 'syncQuery');
      program.main(['sync', query]);
      assert.equal(program.syncQuery.calledOnce, true);
      assert.deepEqual(program.syncQuery.firstCall.args.slice(0, -1), [query]);
    });

    it('should call asyncQuery', function () {
      var program = getSample().program;

      sinon.stub(program, 'asyncQuery');
      program.main(['async', query]);
      assert.equal(program.asyncQuery.calledOnce, true);
      assert.deepEqual(program.asyncQuery.firstCall.args.slice(0, -1), [query]);
    });

    it('should call asyncPoll', function () {
      var program = getSample().program;

      sinon.stub(program, 'asyncPoll');
      program.main(['poll', jobId]);
      assert.equal(program.asyncPoll.calledOnce, true);
      assert.deepEqual(program.asyncPoll.firstCall.args.slice(0, -1), [jobId]);
    });
  });
});
