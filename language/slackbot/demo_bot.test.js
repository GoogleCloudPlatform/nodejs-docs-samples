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

const text = `President Obama is speaking at the White House.`;

function getSample () {
  const controllerMock = {
    spawn: sinon.stub().returnsThis(),
    startRTM: sinon.stub().returnsThis(),
    hears: sinon.stub().returnsThis(),
    on: sinon.stub().returnsThis()
  };

  const botkitMock = {
    slackbot: sinon.stub().returns(controllerMock)
  };

  return {
    program: proxyquire(`./demo_bot`, {
      botkit: botkitMock
    }),
    mocks: {
      botkit: botkitMock,
      controller: controllerMock
    }
  };
}

describe(`demo_bot`, () => {
  it(`should analyze sentiment in text`, () => {
    const sample = getSample();

    return sample.program.analyzeSentimentOfText(text)
      .then((sentiment) => {
        assert.equal(sentiment > 0, true);
      });
  });

  it(`should analyze entities in`);

  it(`should reply to simple hello message`);

  it(`should reply to entities message`);

  it(`should start the controller`);
});
