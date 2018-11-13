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

const fs = require(`fs`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);

const SLACK_TOKEN_PATH = path.join(__dirname, `../.token`);

let controllerMock, botkitMock, program, originalToken;

test.before(() => {
  originalToken = process.env.SLACK_TOKEN_PATH;
  controllerMock = {
    spawn: sinon.stub().returnsThis(),
    startRTM: sinon.stub().returnsThis(),
    hears: sinon.stub().returnsThis(),
    on: sinon.stub().returnsThis(),
  };
  botkitMock = {
    slackbot: sinon.stub().returns(controllerMock),
  };
  program = proxyquire(`../demo_bot`, {
    botkit: botkitMock,
    sqlite3: {
      verbose: sinon.stub().returns({
        cached: {
          Database: sinon.stub().returns({
            run: sinon.stub(),
          }),
        },
      }),
    },
  });
});

test.after.always(() => {
  process.env.SLACK_TOKEN_PATH = originalToken;
  try {
    fs.unlinkSync(SLACK_TOKEN_PATH);
  } catch (err) {
    // Ignore error
  }
});

test(`should check SLACK_TOKEN_PATH`, t => {
  process.env.SLACK_TOKEN_PATH = ``;

  t.throws(
    () => {
      program.startController();
    },
    Error,
    `Please set the SLACK_TOKEN_PATH environment variable!`
  );
});

test(`should start the controller`, t => {
  let controller;

  fs.writeFileSync(SLACK_TOKEN_PATH, `test`, {encoding: `utf8`});
  process.env.SLACK_TOKEN_PATH = SLACK_TOKEN_PATH;

  controller = program.startController();

  t.is(controller === controllerMock, true);
  t.is(controllerMock.spawn.callCount, 1);
  t.is(controllerMock.startRTM.callCount, 1);
  t.is(controllerMock.hears.callCount, 2);
  t.is(controllerMock.on.callCount, 2);
});
