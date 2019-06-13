/**
 * Copyright 2019, Google LLC.
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');

function getSample({error=false}) {
  const incrMock = (key, callback) => {
    if (error) {
     return callback(new Error('Error incrementing count'));
    }
    callback(null, 1);
  };
  const clientMock = {
    on: sinon.spy(),
    incr: sinon.stub().callsFake(incrMock),
  };
  const redisMock = {
    createClient: sinon.stub().returns(clientMock),
  };

  return {
    program: proxyquire('../', {
      redis: redisMock,
    }),
    mocks: {
      client: clientMock,
      req: {},
      res: {
        end: sinon.stub().returnsThis(),
        send: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        writeHead: sinon.stub().returnsThis(),
      },
    },
  };
}

describe('visitCount', () => {
  it('should try to increment the Redis counter', () => {
    const {program, mocks} = getSample({error: false});

    program.visitCount(mocks.req, mocks.res);

    assert.strictEqual(mocks.client.incr.calledWith('visits'), true);
  });

  it('should send the count in the HTTP response if successful', () => {
    const {program, mocks} = getSample({error: false});

    program.visitCount(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.writeHead.calledWith(200), true);
    assert.strictEqual(mocks.res.end.calledWith('Visit count: 1'), true);
  });

  it('should send a 500 HTTP response if unsuccessful', () => {
    const {program, mocks} = getSample({error: true});

    program.visitCount(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledWith(500), true);
    assert.strictEqual(mocks.res.send.calledWith('Error incrementing count'), true);
  });
});
