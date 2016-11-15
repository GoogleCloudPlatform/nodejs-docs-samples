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

require(`../../test/_setup`);

const proxyquire = require(`proxyquire`).noCallThru();

test(`should handle error`, (t) => {
  const error = new Error(`error`);
  const fileName = `./resources/audio.raw`;
  const config = {
    encoding: 'LINEAR16',
    sampleRate: 16000
  };
  const speechMock = {
    recognize: sinon.stub().yields(error)
  };
  const SpeechMock = sinon.stub().returns(speechMock);

  proxyquire(`../quickstart`, {
    '@google-cloud/speech': SpeechMock
  });

  t.is(SpeechMock.calledOnce, true);
  t.deepEqual(SpeechMock.firstCall.args, [{ projectId: `YOUR_PROJECT_ID` }]);
  t.is(speechMock.recognize.calledOnce, true);
  t.deepEqual(speechMock.recognize.firstCall.args.slice(0, -1), [fileName, config]);
  // t.is(console.error.calledOnce, true);
  // t.deepEqual(console.error.firstCall.args, [error]);
});
