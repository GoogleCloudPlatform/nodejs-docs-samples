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
    program: proxyquire('../query', {
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
  describe('main', function () {
    it('should show usage based on arguments', function () {
      var program = getSample().program;
      sinon.stub(program, 'printUsage');

      program.main([]);
      assert(program.printUsage.calledOnce);

      program.main(['-h']);
      assert(program.printUsage.calledTwice);

      program.main(['--help']);
      assert(program.printUsage.calledThrice);
    });

    it('should run the correct commands', function () {
      var program = getSample().program;
      sinon.stub(program, 'syncQuery');
      sinon.stub(program, 'asyncQuery');
      sinon.stub(program, 'asyncPoll');

      program.main(['sync']);
      assert(program.syncQuery.calledOnce);

      program.main(['async']);
      assert(program.asyncQuery.calledOnce);

      program.main(['poll']);
      assert(program.asyncPoll.calledOnce);
    });

    it('should execute queries', function () {
      var example = getSample();
      sinon.stub(example.program, 'syncQuery');

      example.program.main(['foo'], function (err, data) {
        assert.ifError(err);
        assert(example.program.syncQuery.calledWith({ query: 'foo' }));
        assert.deepEqual(data, example.mocks.natality);
      });
    });
  });

  describe('syncQuery', function () {
    var query = 'foo';

    it('should return results', function () {
      var example = getSample();
      example.program.syncQuery(query,
        function (err, data) {
          assert.ifError(err);
          assert(example.mocks.bigquery.query.called);
          assert.deepEqual(data, example.mocks.natality);
          assert(console.log.calledWith(
            'SyncQuery: found %d rows!',
            data.length
          ));
        }
      );
    });

    it('should require a query as a string', function () {
      var example = getSample();
      example.program.syncQuery({}, function (err, data) {
        assert.deepEqual(
          err,
          Error('"query" is required, and must be a string!')
        );
        assert.equal(data, undefined);
      });
    });

    it('should handle error', function () {
      var error = Error('syncQueryError');
      var example = getSample();
      example.mocks.bigquery.query = sinon.stub().callsArgWith(1, error);
      example.program.syncQuery(query, function (err, data) {
        assert.deepEqual(err, error);
        assert.equal(data, undefined);
      });
    });
  });

  describe('asyncQuery', function () {
    var query = 'foo';

    it('should submit a job', function () {
      var example = getSample();
      example.program.asyncQuery(query,
        function (err, job) {
          assert.ifError(err);
          assert(example.mocks.bigquery.startQuery.called);
          assert.deepEqual(example.mocks.job, job);
          assert(console.log.calledWith(
            'AsyncQuery: submitted job %s!', example.jobId
          ));
        }
      );
    });

    it('should require a query as a string', function () {
      var example = getSample();
      example.program.asyncQuery({}, function (err, job) {
        assert.deepEqual(err, Error(
          '"query" is required, and must be a string!'
        ));
        assert.equal(job, undefined);
      });
    });

    it('should handle error', function () {
      var error = Error('asyncQueryError');
      var example = getSample();
      example.mocks.bigquery.startQuery = sinon.stub().callsArgWith(1, error);
      example.program.asyncQuery(query, function (err, job) {
        assert.deepEqual(err, error);
        assert.equal(job, undefined);
      });
    });
  });

  describe('asyncPoll', function () {
    it('should get the results of a job given its ID', function () {
      var example = getSample();
      example.mocks.bigquery.job = sinon.stub().returns(example.mocks.job);
      example.program.asyncPoll(example.jobId,
        function (err, rows) {
          assert.ifError(err);
          assert(example.mocks.job.getQueryResults.called);
          assert(console.log.calledWith(
            'AsyncQuery: polled job %s; got %d rows!',
            example.jobId,
            example.mocks.natality.length
          ));
        }
      );
    });

    it('should report the status of a job', function () {
      var example = getSample();
      example.program.asyncPoll(example.jobId, function (err, rows) {
        assert.ifError(err);
        assert(example.mocks.job.getMetadata.called);
        assert(console.log.calledWith(
          'Job status: %s',
          example.mocks.metadata.status.state
        ));
      });
    });

    it('should check whether a job is finished', function () {
      var example = getSample();

      var pendingState = { status: { state: 'PENDING' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, pendingState);
      example.program.asyncPoll(example.jobId, function (err, rows) {
        assert.deepEqual(err, Error('Job %s is not done', example.jobId));
        assert(console.log.calledWith('Job status: %s', pendingState.status.state));
        assert(example.mocks.job.getMetadata.called);
        assert.equal(example.mocks.job.getQueryResults.called, false);
        assert.equal(rows, undefined);
      });

      var doneState = { status: { state: 'DONE' } };
      example.mocks.job.getMetadata = sinon.stub().callsArgWith(0, null, doneState);
      example.program.asyncPoll(example.jobId, function (err, rows) {
        assert.ifError(err);
        assert(console.log.calledWith('Job status: %s', doneState.status.state));
        assert(example.mocks.job.getMetadata.called);
        assert(example.mocks.job.getQueryResults.called);
        assert.equal(rows, example.mocks.natality);
      });
    });

    it('should require a job ID', function () {
      var example = getSample();
      example.program.asyncPoll(null, function (err, rows) {
        assert.deepEqual(err, Error('"jobId" is required!'));
        assert.equal(rows, undefined);
      });
    });

    it('should handle error', function () {
      var error = Error('asyncPollError');
      var example = getSample();
      example.mocks.job.getQueryResults = sinon.stub().callsArgWith(0, error);
      example.program.asyncPoll(example.jobId, function (err, rows) {
        assert.deepEqual(err, error);
        assert.equal(rows, undefined);
      });
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      var program = getSample().program;
      program.printUsage();
      assert(console.log.calledWith('Usage:'));
      assert(console.log.calledWith('\nCommands:\n'));
      assert(console.log.calledWith('\tnode query sync QUERY'));
      assert(console.log.calledWith('\tnode query async QUERY'));
      assert(console.log.calledWith('\tnode query poll JOB_ID'));
      assert(console.log.calledWith('\nExamples:\n'));
      assert(console.log.calledWith('\tnode query sync "SELECT * FROM publicdata:samples.natality LIMIT 5;"'));
      assert(console.log.calledWith('\tnode query async "SELECT * FROM publicdata:samples.natality LIMIT 5;"'));
      assert(console.log.calledWith('\tnode query poll 12345'));
    });
  });
});
