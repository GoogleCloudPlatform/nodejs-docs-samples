// Copyright 2018 Google LLC
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
const assert = require('assert');

const sample = require('../');
const stubConsole = function () {
  sinon.stub(console, 'error');
  sinon.stub(console, 'log');
};

//Restore console
const restoreConsole = function () {
  console.log.restore();
  console.error.restore();
};
beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_tips_retry', () => {
  it('should demonstrate retry behavior for a promise', async () => {
    // Retry by throwing an error
    assert.throws(() => {
      sample.retryPromise({
        data: {
          retry: true,
        },
      });
    }, new Error('Retrying...'));

    // Terminate by returning a rejected promise
    try {
      await sample.retryPromise({data: {}});
    } catch (err) {
      assert.strictEqual(err.message, 'Not retrying...');
      return Promise.resolve();
    }
  });

  it('should demonstrate retry behavior for a callback', done => {
    const cb = sinon.stub();
    const err = new Error('Error!');

    // Retry by passing an error to the callback
    sample.retryCallback(
      {
        data: {
          retry: true,
        },
      },
      cb
    );
    assert.deepStrictEqual(cb.firstCall.args, [err]);

    // Terminate by passing nothing to the callback
    sample.retryCallback({data: {}}, cb);
    assert.deepStrictEqual(cb.secondCall.args, []);
    done();
  });
});

describe('functions_tips_gcp_apis', () => {
  it('should call a GCP API', async () => {
    const {FUNCTIONS_TOPIC} = process.env;
    if (!FUNCTIONS_TOPIC) {
      throw new Error('FUNCTIONS_TOPIC env var must be set.');
    }
    const reqMock = {
      body: {
        topic: FUNCTIONS_TOPIC,
      },
    };
    const resMock = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    sample.gcpApiCall(reqMock, resMock);

    // Instead of modifying the sample to return a promise,
    // use a delay here and keep the sample idiomatic
    await new Promise(resolve => setTimeout(resolve, 1000));

    assert.ok(resMock.status.calledOnce);
    assert.ok(resMock.status.calledWith(200));
  });
});

// Allow-list these region tags with the region-tag enforcer
// describe('functions_tips_connection_pooling functions_tips_infinite_retries')
// describe('functions_tips_lazy_globals functions_tips_scopes')
// describe('run_tips_global_lazy run_tips_global_scope')
// describe('cloudrun_tips_global_lazy cloudrun_tips_global_scope')
