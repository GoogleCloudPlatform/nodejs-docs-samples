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

const sinon = require('sinon');
const assert = require('assert');

function getMocks() {
  return {
    req: {},
    res: {
      end: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
      writeHead: sinon.stub().returnsThis(),
    },
  };
}

describe('visitCount', () => {
  it('should successfully increment the Redis counter', async () => {
    const program = require('../');
    const mocks = getMocks();

    program.visitCount(mocks.req, mocks.res);

    // Give the operation time to complete
    await new Promise(resolve => {
      setTimeout(resolve, 1500);
    });

    assert.strictEqual(mocks.res.status.called, false);
    assert.strictEqual(mocks.res.send.called, false);
    assert.strictEqual(mocks.res.writeHead.calledWith(200), true);
    assert.strictEqual(mocks.res.end.calledOnce, true);

    const response = mocks.res.end.firstCall.args[0];
    assert.strictEqual(response.startsWith('Visit count:'), true);
  });
});
