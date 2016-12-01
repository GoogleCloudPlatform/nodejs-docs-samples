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

const fs = require(`fs`);
const path = require(`path`);
const proxyquire = require(`proxyquire`).noCallThru();
const sqlite3 = require(`sqlite3`).verbose();

const DB_PATH = path.join(__dirname, `./slackDB.db`);
const SLACK_TOKEN_PATH = path.join(__dirname, `./.token`);
const text = `President Obama is speaking at the White House.`;

describe(`demo_bot`, () => {
  let db, controllerMock, botkitMock, botMock, program;

  before((done) => {
    fs.unlink(DB_PATH, (err) => {
      if (err && err.code !== `ENOENT`) {
        done(err);
        return;
      }

      db = new sqlite3.cached.Database(DB_PATH);
      controllerMock = {
        spawn: sinon.stub().returnsThis(),
        startRTM: sinon.stub().returnsThis(),
        hears: sinon.stub().returnsThis(),
        on: sinon.stub().returnsThis()
      };

      botkitMock = {
        slackbot: sinon.stub().returns(controllerMock)
      };

      botMock = {
        reply: sinon.stub()
      };

      program = proxyquire(`./demo_bot`, {
        botkit: botkitMock
      });

      db.run(program.TABLE_SQL, done);
    });
  });

  after((done) => {
    fs.unlink(DB_PATH, (err) => {
      if (err) {
        done(err);
        return;
      }
      fs.unlink(SLACK_TOKEN_PATH, done);
    });
  });

  it(`should analyze sentiment in text`, () => {
    return program.analyzeSentiment(text)
      .then((sentiment) => {
        assert.equal(sentiment > 0, true);
      });
  });

  it(`should analyze entities in text`, () => {
    return program.analyzeEntities(text, 1234)
      .then((entities) => {
        assert.equal(entities.some((entity) => entity.name === `Obama`), true);
        assert.equal(entities.some((entity) => entity.name === `White House`), true);

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            db.all(program.ENTITIES_SQL, (err, entities) => {
              if (err) {
                reject(err);
                return;
              }
              assert.equal(entities.some((entity) => entity.name === `Obama`), true);
              assert.equal(entities.some((entity) => entity.name === `White House`), true);
              resolve();
            });
          }, 1000);
        });
      });
  });

  it(`should reply to simple hello message`, () => {
    const message = {};

    program.handleSimpleReply(botMock, message);

    assert.equal(botMock.reply.callCount, 1);
    assert.deepEqual(botMock.reply.getCall(0).args, [message, `Hello.`]);
  });

  it(`should reply to entities message`, (done) => {
    const message = {};

    program.handleEntitiesReply(botMock, message);

    setTimeout(() => {
      assert.equal(botMock.reply.callCount, 3);
      assert.deepEqual(botMock.reply.getCall(1).args, [message, `Top entities: `]);
      assert.deepEqual(botMock.reply.getCall(2).args, [message, `entity: *Obama*, type: PERSON, count: 1\nentity: *White House*, type: LOCATION, count: 1\n`]);
      done();
    }, 1000);
  });

  describe(`startController`, () => {
    let originalToken;

    before(() => {
      originalToken = process.env.SLACK_TOKEN_PATH;
    });

    after(() => {
      process.env.SLACK_TOKEN_PATH = originalToken;
    });

    it(`should check SLACK_TOKEN_PATH`, () => {
      process.env.SLACK_TOKEN_PATH = ``;

      assert.throws(() => {
        program.startController();
      }, Error, `Please set the SLACK_TOKEN_PATH environment variable!`);
    });

    it(`should start the controller`, () => {
      let controller;

      fs.writeFileSync(SLACK_TOKEN_PATH, `test`, { encoding: `utf8` });
      process.env.SLACK_TOKEN_PATH = SLACK_TOKEN_PATH;

      controller = program.startController();

      assert.strictEqual(controller, controllerMock);
      assert.equal(controllerMock.spawn.callCount, 1);
      assert.equal(controllerMock.startRTM.callCount, 1);
      assert.equal(controllerMock.hears.callCount, 2);
      assert.equal(controllerMock.on.callCount, 1);
    });
  });
});
