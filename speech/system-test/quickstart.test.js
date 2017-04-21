/**
 * Copyright 2017, Google, Inc.
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
const sinon = require(`sinon`);
const speech = proxyquire(`@google-cloud/speech`, {})();
const test = require(`ava`);

const {
  checkCredentials,
  stubConsole,
  restoreConsole
} = require(`@google-cloud/nodejs-repo-tools`);

const fileName = path.join(__dirname, `../resources/audio.raw`);
const config = {
  encoding: `LINEAR16`,
  sampleRateHertz: 16000,
  languageCode: `en-US`
};

test.before(checkCredentials);
test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should detect speech`, (t) => {
  const expectedFileName = `./resources/audio.raw`;
  const expectedText = `how old is the Brooklyn Bridge`;

  const speechMock = {
    recognize: (_fileName, _config) => {
      t.is(_fileName, expectedFileName);
      t.deepEqual(_config, config);

      return speech.recognize(fileName, config)
        .then(([transcription]) => {
          t.is(transcription, expectedText);

          setTimeout(() => {
            try {
              t.is(console.log.callCount, 1);
              t.deepEqual(console.log.getCall(0).args, [`Transcription: ${expectedText}`]);
              t.end();
            } catch (err) {
              t.end(err);
            }
          }, 200);

          return [transcription];
        });
    }
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/speech': sinon.stub().returns(speechMock)
  });
});
