// Copyright 2023 Google LLC
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

const {getFunction} = require('@google-cloud/functions-framework/testing');
const sinon = require('sinon');
const assert = require('assert');
require('..');

const jsonRetryObject = JSON.stringify({retry: true});
const encodedRetryMessage = Buffer.from(jsonRetryObject).toString('base64');

const jsonDontRetryObject = JSON.stringify({retry: false});
const encodedDontRetryMessage =
  Buffer.from(jsonDontRetryObject).toString('base64');

describe('functions_cloudevent_tips_retry', () => {
  it('should demonstrate retry behavior for a promise', async () => {
    const retryPromise = getFunction('retryPromise');

    // Retry by throwing an error
    assert.throws(() => {
      retryPromise({
        data: {
          message: {
            data: encodedRetryMessage,
          },
        },
      });
    }, new Error('Retrying...'));

    // Terminate by returning a rejected promise
    try {
      await retryPromise({data: {message: {data: encodedDontRetryMessage}}});
    } catch (err) {
      assert.strictEqual(err.message, 'Not retrying...');
      return Promise.resolve();
    }
  });

  it('should demonstrate retry behavior for a callback', done => {
    const retryCallback = getFunction('retryCallback');
    const cb = sinon.stub();
    const err = new Error('Error!');

    // Retry by passing an error to the callback
    retryCallback(
      {
        data: {
          message: {
            data: encodedRetryMessage,
          },
        },
      },
      cb
    );
    assert.deepStrictEqual(cb.firstCall.args, [err]);

    // Terminate by passing nothing to the callback
    retryCallback({data: {message: {data: encodedDontRetryMessage}}}, cb);
    assert.deepStrictEqual(cb.secondCall.args, []);
    done();
  });
});
