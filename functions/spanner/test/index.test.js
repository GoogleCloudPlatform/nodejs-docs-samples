// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');

const entities = [
  {
    SingerId: 1,
    AlbumId: 1,
    AlbumTitle: 'Go, Go, Go',
  },
  {
    SingerId: 1,
    AlbumId: 2,
    AlbumTitle: 'Total Junk',
  },
];

const query = {
  sql: 'SELECT * FROM Albums',
};

const getSample = () => {
  const resultsMock = entities.map(row => {
    return {toJSON: sinon.stub().returns(row)};
  });
  const databaseMock = {
    run: sinon.stub().returns(Promise.resolve([resultsMock])),
  };
  const instanceMock = {
    database: sinon.stub().returns(databaseMock),
  };
  const spannerMock = {
    instance: sinon.stub().returns(instanceMock),
  };

  const SpannerMock = sinon.stub().returns(spannerMock);

  return {
    program: proxyquire('../', {
      '@google-cloud/spanner': {Spanner: SpannerMock},
    }),
    mocks: {
      spanner: spannerMock,
      database: databaseMock,
      instance: instanceMock,
      results: resultsMock,
      res: {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
        end: sinon.stub().returnsThis(),
        write: sinon.stub().returnsThis(),
      },
    },
  };
};

describe('spanner_functions_quickstart', () => {
  it('get: Gets albums', async () => {
    const sample = getSample();
    const {mocks} = sample;

    await sample.program.get(mocks.req, mocks.res);
    assert.strictEqual(mocks.spanner.instance.called, true);
    assert.strictEqual(mocks.instance.database.called, true);
    assert.strictEqual(mocks.database.run.calledWith(query), true);
    assert.strictEqual(mocks.results[0].toJSON.called, true);
    assert.strictEqual(
      mocks.res.write.calledWith(
        'SingerId: 1, AlbumId: 2, AlbumTitle: Total Junk\n'
      ),
      true
    );
    assert.strictEqual(mocks.res.end.called, true);
  });
});
