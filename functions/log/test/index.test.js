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
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

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

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`should write to log`, (t) => {
  const expectedMsg = `I am a log entry!`;
  const res = { end: sinon.stub() };

  getSample().program.helloWorld({}, res);

  t.is(console.log.callCount, 1);
  t.deepEqual(console.log.firstCall.args, [expectedMsg]);
  t.is(res.end.callCount, 1);
  t.deepEqual(res.end.firstCall.args, []);
});

test.serial(`getLogEntries: should retrieve logs`, (t) => {
  const sample = getSample();

  return sample.program.getLogEntries()
    .then((entries) => {
      t.true(console.log.calledWith(`Entries:`));
      t.true(entries === sample.mocks.results[0]);
    });
});

test.serial(`getMetrics: should retrieve metrics`, (t) => {
  const sample = getSample();
  const callback = sinon.stub();

  sample.program.getMetrics(callback);

  t.is(callback.callCount, 1);
});

test(`processLogEntry: should process log entry`, (t) => {
  const sample = getSample();
  const json = JSON.stringify({
    protoPayload: {
      methodName: 'method',
      resourceName: 'resource',
      authenticationInfo: {
        principalEmail: 'me@example.com'
      }
    }
  });

  const data = {
    data: {
      data: Buffer.from(json, 'ascii')
    }
  };

  sample.program.processLogEntry(data);

  t.true(console.log.calledWith(`Method: method`));
  t.true(console.log.calledWith(`Resource: resource`));
  t.true(console.log.calledWith(`Initiator: me@example.com`));
});

test(`processLogEntry: should work in Node 8`, (t) => {
  const sample = getSample();
  const json = JSON.stringify({
    protoPayload: {
      methodName: 'method',
      resourceName: 'resource',
      authenticationInfo: {
        principalEmail: 'me@example.com'
      }
    }
  });

  const data = {
    data: Buffer.from(json, 'ascii')
  };

  sample.program.processLogEntry(data);

  t.true(console.log.calledWith(`Method: method`));
  t.true(console.log.calledWith(`Resource: resource`));
  t.true(console.log.calledWith(`Initiator: me@example.com`));
});
