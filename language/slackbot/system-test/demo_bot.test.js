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
const sqlite3 = require(`sqlite3`).verbose();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const DB_PATH = path.join(__dirname, `../slackDB.db`);
const SLACK_TOKEN_PATH = path.join(__dirname, `../.token`);
const text = `President Obama is speaking at the White House. He is announcing an amazing new cookie recipe.`;

let db, controllerMock, botkitMock, botMock, program;

test.before(tools.checkCredentials);
test.before.cb(t => {
  fs.unlink(DB_PATH, err => {
    if (err && err.code !== `ENOENT`) {
      t.end(err);
      return;
    }

    db = new sqlite3.cached.Database(DB_PATH);
    controllerMock = {
      spawn: sinon.stub().returnsThis(),
      startRTM: sinon.stub().returnsThis(),
      hears: sinon.stub().returnsThis(),
      on: sinon.stub().returnsThis(),
    };

    botkitMock = {
      slackbot: sinon.stub().returns(controllerMock),
    };

    botMock = {
      reply: sinon.stub(),
    };

    program = proxyquire(`../demo_bot`, {
      botkit: botkitMock,
    });

    db.run(program.TABLE_SQL, t.end);
  });
});

test.after.cb.always(t => {
  fs.unlink(DB_PATH, err => {
    if (err) {
      t.end(err);
      return;
    }
    try {
      fs.unlinkSync(SLACK_TOKEN_PATH);
    } catch (err) {
      // Ignore error
    }
    t.end();
  });
});

test.serial(`should analyze sentiment in text`, async t => {
  const results = await program.analyzeSentiment(text);
  t.is(results.documentSentiment.score > 0, true);
});

test.serial(`should analyze entities in text`, async t => {
  const entities = await program.analyzeEntities(text, Date.now());
  t.is(entities.some(entity => entity.name === `Obama`), true);
  t.is(entities.some(entity => entity.name === `White House`), true);

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      db.all(`select * from entities`, (err, entities) => {
        if (err) {
          reject(err);
          return;
        }
        t.is(entities.some(entity => entity.name === `Obama`), true);
        t.is(entities.some(entity => entity.name === `White House`), true);
        resolve();
      });
    }, 1000);
  });
});

test.serial(`should reply to simple hello message`, t => {
  const message = {};

  program.handleSimpleReply(botMock, message);

  t.is(botMock.reply.callCount, 1);
  t.deepEqual(botMock.reply.getCall(0).args, [message, `Hello.`]);
});

test.cb.serial(`should reply to entities message`, t => {
  const message = {};

  program.handleEntitiesReply(botMock, message);

  setTimeout(() => {
    try {
      t.is(botMock.reply.callCount, 3);
      t.deepEqual(botMock.reply.getCall(1).args, [message, `Top entities: `]);
      t.deepEqual(botMock.reply.getCall(2).args, [
        message,
        `entity: *Obama*, type: PERSON, count: 1\nentity: *White House*, type: LOCATION, count: 1\nentity: *cookie recipe*, type: WORK_OF_ART, count: 1\n`,
      ]);
      t.end();
    } catch (err) {
      t.end(err);
    }
  }, 1000);
});
