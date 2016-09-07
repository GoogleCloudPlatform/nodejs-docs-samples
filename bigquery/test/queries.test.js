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

var shakespeareQuery = 'SELECT\n' +
  '  TOP(corpus, 10) as title,\n' +
  '  COUNT(*) as unique_words\n' +
  'FROM `publicdata.samples.shakespeare`;';

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
    getQueryResults: sinon.stub().yields(null, natalityMock),
    getMetadata: sinon.stub().yields(null, metadataMock),
    on: sinon.stub().returnsThis()
  };
  jobMock.on.withArgs('complete').yields(null, metadataMock);

  var bigqueryMock = {
    job: sinon.stub().returns(jobMock),
    startQuery: sinon.stub().yields(null, jobMock),
    query: sinon.stub().yields(null, natalityMock)
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
  describe('printExample', function () {
    it('should return results', function () {
      var example = getSample();

      example.program.printExample([
        {
          foo: 'bar',
          beep: 'boop'
        }
      ]);

      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Query Results:']);
      assert.deepEqual(console.log.secondCall.args, ['foo: bar\nbeep: boop']);
    });
  });

  describe('queryShakespeare', function () {
    it('should query shakespeare', function () {
      var example = getSample();
      var callback = sinon.stub();
      var mockResult = [];
      example.mocks.bigquery.query.yields(null, mockResult);

      example.program.queryShakespeare(callback);

      assert.equal(example.mocks.bigquery.query.calledOnce, true);
      assert.deepEqual(example.mocks.bigquery.query.firstCall.args.slice(0, -1), [{
        query: shakespeareQuery,
        useLegacySql: false
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, mockResult]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Query Results:']);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.query.yields(error);

      example.program.queryShakespeare(callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('syncQuery', function () {
    var query = 'foo';

    it('should return results', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.syncQuery(query, callback);

      assert.equal(example.mocks.bigquery.query.calledOnce, true);
      assert.deepEqual(example.mocks.bigquery.query.firstCall.args.slice(0, -1), [{
        query: query,
        timeoutMs: 10000,
        useLegacySql: false
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, example.mocks.natality]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Received %d row(s)!', example.mocks.natality.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.query.yields(error);

      example.program.syncQuery(query, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('asyncQuery', function () {
    var query = 'foo';

    it('should submit a job', function () {
      var example = getSample();
      var callback = sinon.stub();

      example.program.asyncQuery(query, callback);

      assert.equal(example.mocks.bigquery.startQuery.calledOnce, true);
      assert.deepEqual(example.mocks.bigquery.startQuery.firstCall.args.slice(0, -1), [{
        query: query,
        useLegacySql: false
      }]);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, example.mocks.natality]);
      assert.equal(console.log.calledTwice, true);
      assert.deepEqual(console.log.firstCall.args, ['Started job: %s', example.jobId]);
      assert.deepEqual(console.log.secondCall.args, ['Job complete, received %d row(s)!', example.mocks.natality.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.startQuery.yields(error);

      example.program.asyncQuery(query, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('waitForJob', function () {
    it('should get the results of a job given its ID', function () {
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.bigquery.job.returns(example.mocks.job);

      example.program.waitForJob(example.jobId, callback);

      assert.equal(example.mocks.job.on.calledTwice, true);
      assert.deepEqual(example.mocks.job.on.firstCall.args.slice(0, -1), ['error']);
      assert.deepEqual(example.mocks.job.on.secondCall.args.slice(0, -1), ['complete']);
      assert.equal(example.mocks.job.getQueryResults.calledOnce, true);
      assert.deepEqual(example.mocks.job.getQueryResults.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, example.mocks.natality]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Job complete, received %d row(s)!', example.mocks.natality.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var example = getSample();
      var callback = sinon.stub();
      example.mocks.job.getQueryResults.yields(error);

      example.program.waitForJob(example.jobId, callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
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

    it('should call waitForJob', function () {
      var program = getSample().program;

      sinon.stub(program, 'waitForJob');
      program.main(['wait', jobId]);
      assert.equal(program.waitForJob.calledOnce, true);
      assert.deepEqual(program.waitForJob.firstCall.args.slice(0, -1), [jobId]);
    });
  });
});
