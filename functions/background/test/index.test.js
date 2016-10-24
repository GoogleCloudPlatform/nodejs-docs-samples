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
  const requestPromise = sinon.stub().returns(Promise.resolve(`test`));

  return {
    program: proxyquire(`../`, {
      'request-promise': requestPromise
    }),
    mocks: {
      requestPromise: requestPromise
    }
  };
}

describe(`functions:background`, () => {
  it(`should echo message`, () => {
    const event = {
      payload: {
        myMessage: `hi`
      }
    };
    const sample = getSample();
    const callback = sinon.stub();

    sample.program.helloWorld(event, callback);

    assert.equal(console.log.callCount, 1);
    assert.deepEqual(console.log.firstCall.args, [event.payload.myMessage]);
    assert.equal(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, []);
  });

  it(`should say no message was provided`, () => {
    const error = new Error(`No message defined!`);
    const callback = sinon.stub();
    const sample = getSample();
    sample.program.helloWorld({ payload: {} }, callback);

    assert.equal(callback.callCount, 1);
    assert.deepEqual(callback.firstCall.args, [error]);
  });

  it(`should make a promise request`, () => {
    const sample = getSample();
    const event = {
      payload: {
        endpoint: `foo.com`
      }
    };

    return sample.program.helloPromise(event)
      .then((result) => {
        assert.deepEqual(sample.mocks.requestPromise.firstCall.args, [{ uri: `foo.com` }]);
        assert.equal(result, `test`);
      });
  });

  it(`should return synchronously`, () => {
    assert.equal(getSample().program.helloSynchronous({
      payload: {
        something: true
      }
    }), `Something is true!`);
  });

  it(`should throw an error`, () => {
    assert.throws(() => {
      getSample().program.helloSynchronous({
        payload: {
          something: false
        }
      });
    }, Error, `Something was not true!`);
  });
});
