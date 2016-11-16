/**
 * Copyright 2016, Google, Inc.
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

function getSample () {
  const results = [[{}], {}];
  const stream = {
    on: sinon.stub().returnsThis()
  };
  stream.on.withArgs('end').yields();

  const monitoring = {
    projectPath: sinon.stub(),
    listTimeSeries: sinon.stub().returns(stream)
  };
  const logging = {
    getEntries: sinon.stub().returns(Promise.resolve(results))
  };

  return {
    program: proxyquire(`../`, {
      '@google-cloud/logging': sinon.stub().returns(logging),
      '@google-cloud/monitoring': {
        v3: sinon.stub().returns({
          metricServiceApi: sinon.stub().returns(monitoring)
        })
      }
    }),
    mocks: {
      monitoring: monitoring,
      logging: logging,
      results: results
    }
  };
}

describe(`functions:log`, () => {
  it(`should write to log`, () => {
    const expectedMsg = `I am a log entry!`;
    const callback = sinon.stub();

    getSample().program.helloWorld({}, callback);

    assert.equal(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [expectedMsg]);
    assert.equal(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`getLogEntries: should retrieve logs`, () => {
    const sample = getSample();

    return sample.program.getLogEntries()
      .then((entries) => {
        assert.equal(console.log.calledWith(`Entries:`), true);
        assert.strictEqual(entries, sample.mocks.results[0]);
      });
  });

  it(`getMetrics: should retrieve metrics`, () => {
    const sample = getSample();
    const callback = sinon.stub();

    sample.program.getMetrics(callback);

    assert.equal(callback.callCount, 1);
  });
});

