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

const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const speech = proxyquire(`@google-cloud/speech`, {})();

const fileName = path.join(__dirname, `../resources/audio.raw`);
const config = {
  encoding: `LINEAR16`,
  sampleRate: 16000
};

describe(`speech:quickstart`, () => {
  it(`should detect speech`, (done) => {
    const expectedFileName = `./resources/audio.raw`;
    const expectedText = `how old is the Brooklyn Bridge`;

    const speechMock = {
      recognize: (_fileName, _config) => {
        assert.equal(_fileName, expectedFileName);
        assert.deepEqual(_config, config);

        return speech.recognize(fileName, config)
          .then((results) => {
            const transcription = results[0];
            assert.equal(transcription, expectedText);

            setTimeout(() => {
              assert.equal(console.log.callCount, 1);
              assert.deepEqual(console.log.getCall(0).args, [`Transcription: ${expectedText}`]);
              done();
            }, 200);

            return results;
          });
      }
    };

    proxyquire(`../quickstart`, {
      '@google-cloud/speech': sinon.stub().returns(speechMock)
    });
  });
});
