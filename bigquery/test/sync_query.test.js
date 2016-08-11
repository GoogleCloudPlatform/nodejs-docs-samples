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

  var bigqueryMock = {
    query: sinon.stub().callsArgWith(1, null, natalityMock)
  };
  var gcloudMock = {
    bigquery: sinon.stub().returns(bigqueryMock)
  };
  return {
    program: proxyquire('../sync_query', {
      gcloud: gcloudMock
    }),
    mocks: {
      gcloud: gcloudMock,
      bigquery: bigqueryMock,
      natality: natalityMock
    }
  };
}

describe('bigquery:sync_query', function () {
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
    var queryObj = { query: query };

    it('should return results', function () {
      var example = getSample();
      example.program.syncQuery(queryObj,
        function (err, data) {
          assert.ifError(err);
          assert(example.mocks.bigquery.query.calledWith(queryObj));
          assert.deepEqual(data, example.mocks.natality);
          assert(console.log.calledWith('Found %d rows!', data.length));
        }
      );
    });

    it('should require a query', function () {
      var example = getSample();
      example.program.syncQuery({}, function (err, data) {
        assert.deepEqual(err, Error('queryObj must be an object with a "query" parameter'));
        assert.equal(data, undefined);
      });
    });

    it('should handle error', function () {
      var error = Error('syncQueryError');
      var example = getSample();
      example.mocks.bigquery.query = sinon.stub().callsArgWith(1, error);
      example.program.syncQuery(queryObj, function (err, data) {
        assert.deepEqual(err, error);
        assert.equal(data, undefined);
      });
    });
  });

  describe('printUsage', function () {
    it('should print usage', function () {
      var program = getSample().program;
      program.printUsage();
      assert(console.log.calledWith('Usage: node sync_query QUERY'));
      assert(console.log.calledWith('\nExamples:\n'));
      assert(console.log.calledWith('\tnode sync_query "SELECT * FROM publicdata:samples.natality LIMIT 5;"'));
    });
  });
});
