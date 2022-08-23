// Copyright 2022 Google LLC
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
