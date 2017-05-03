/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);

const entities = [
  {
    SingerId: { value: 1 },
    AlbumId: { value: 1 },
    AlbumTitle: 'Go, Go, Go'
  },
  {
    SingerId: { value: 1 },
    AlbumId: { value: 2 },
    AlbumTitle: 'Total Junk'
  }
];

const query = {
  sql: 'SELECT * FROM Albums'
};

function getSample () {
  const resultsMock = entities.map((row) => {
    return { toJSON: sinon.stub().returns(row) };
  });
  const databaseMock = {
    run: sinon.stub().returns(Promise.resolve([resultsMock]))
  };
  const instanceMock = {
    database: sinon.stub().returns(databaseMock)
  };
  const spannerMock = {
    instance: sinon.stub().returns(instanceMock)
  };

  const SpannerMock = sinon.stub().returns(spannerMock);

  return {
    program: proxyquire(`../`, {
      '@google-cloud/spanner': SpannerMock
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
        write: sinon.stub().returnsThis()
      }
    }
  };
}

test(`get: Gets albums`, async (t) => {
  const sample = getSample();
  const mocks = sample.mocks;

  await sample.program.get(mocks.req, mocks.res);
  t.true(mocks.spanner.instance.called);
  t.true(mocks.instance.database.called);
  t.true(mocks.database.run.calledWith(query));
  t.true(mocks.results[0].toJSON.called);
  t.true(mocks.res.write.calledWith(`SingerId: 1, AlbumId: 2, AlbumTitle: Total Junk\n`));
  t.true(mocks.res.end.called);
});
