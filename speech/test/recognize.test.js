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

describe(`speech:recognize`, () => {
  it(`should handle errors`, () => {
    const filename = `audio.raw`;
    const error = new Error(`error`);
    const callback = sinon.spy();
    const speechMock = {
      recognize: sinon.stub().yields(error),
      startRecognition: sinon.stub().yields(error)
    };
    const SpeechMock = sinon.stub().returns(speechMock);
    const program = proxyquire(`../recognize`, {
      '@google-cloud/speech': SpeechMock
    });

    program.syncRecognize(filename, callback);
    program.asyncRecognize(filename, callback);

    assert.equal(callback.callCount, 2);
    assert.equal(callback.alwaysCalledWithExactly(error), true);
  });
});
