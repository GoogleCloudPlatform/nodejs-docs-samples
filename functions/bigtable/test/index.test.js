// Copyright 2020 Google LLC
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const {PassThrough} = require('stream');

let mockedStream;
const rows = [
  {
    id: "phone#4c410523#20190501",
    data: {
      stats_summary: {
        os_build: [{
          value: "PQ2A.190405.003"
        }]
      }
    },
  },
  {
    id: "phone#5c10102#20190501",
    data: {
      stats_summary: {
        os_build: [{
          value: "PQ2A.190406.000"
        }]
      }
    },
  },
];

const query = {
  prefix: "phone#"
};

const getSample = () => {
  mockedStream = require('stream').Readable.from(rows);

  const tableMock = {
    createReadStream: sinon.stub().returns(mockedStream),
  };
  const instanceMock = {
    table: sinon.stub().returns(tableMock),
  };
  const bigtableMock = {
    instance: sinon.stub().returns(instanceMock),
  };

  const BigtableMock = sinon.stub().returns(bigtableMock);

  return {
    program: proxyquire('../', {
      '@google-cloud/bigtable': {Bigtable: BigtableMock},
    }),
    mocks: {
      bigtable: bigtableMock,
      table: tableMock,
      instance: instanceMock,
      res: {
        status: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
        end: sinon.stub().returnsThis(),
        write: sinon.stub().returnsThis(),
      },
    },
  };
};

describe('bigtable_functions_quickstart', () => {
  it('get: Gets rows', async () => {
    const sample = getSample();
    const {mocks} = sample;
    await sample.program.get(mocks.req, mocks.res);
    rows.forEach((row) => {
      mockedStream.emit('data', row);
    });
    mockedStream.emit("end");
    assert.strictEqual(mocks.bigtable.instance.called, true);
    assert.strictEqual(mocks.instance.table.called, true);
    assert.strictEqual(mocks.table.createReadStream.calledWith(query), true);
    assert.strictEqual(
        mocks.res.write.calledWith(
            'rowkey: phone#4c410523#20190501, os_build: PQ2A.190405.003\n'
        ),
        true
    );
    assert.strictEqual(
        mocks.res.write.calledWith(
            'rowkey: phone#5c10102#20190501, os_build: PQ2A.190406.000\n'
        ),
        true
    );
    assert.strictEqual(mocks.res.end.called, true);
  });
});
