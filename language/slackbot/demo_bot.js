/* *****************************************************************************
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
********************************************************************************

This is a Slack bot built using the Botkit library (http://howdy.ai/botkit). It
runs on a Kubernetes cluster, and uses one of the Google Cloud Platform's ML
APIs, the Natural Language API, to interact in a Slack channel. It does this in
two respects.

First, it uses the NL API to assess the "sentiment" of any message posted to
the channel, and if the positive or negative magnitude of the statement is
sufficiently large, it sends a 'thumbs up' or 'thumbs down' in reaction.

Second, it uses the NL API to identify the 'entities' in each posted message,
and tracks them in a database (using sqlite3).  Then, at any time you can
query the NL slackbot to ask it for the top N entities used in the channel.

The README walks through how to run the NL slackbot as an app on a
Google Container Engine/Kubernetes cluster, but you can also just run the bot
locally if you like.
To do this, create a file containing your Slack token (as described in
the README), then point 'SLACK_TOKEN_PATH' to that file when you run the script:

    echo my-slack-token > slack-token
    SLACK_TOKEN_PATH=./slack-token node demo_bot.js

See the README.md in this directory for more information about setup and usage.

*/

'use strict';

const Botkit = require('botkit');
const fs = require('fs');
const Language = require('@google-cloud/language');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const controller = Botkit.slackbot({debug: false});

// create our database if it does not already exist.
const db = new sqlite3.cached.Database(path.join(__dirname, './slackDB.db'));
// comment out the line above, and instead uncomment the following, to store
// the db on a persistent disk mounted at /var/sqlite3.  See the README
// section on 'using a persistent disk' for this config.
// const db = new sqlite3.cached.Database('/var/sqlite3/slackDB.db');

// the number of most frequent entities to retrieve from the db on request.
const NUM_ENTITIES = 20;
// The threshold of sentiment score of a posted text, above which the bot will
// respond. This threshold is rather arbitrary; you may want to play with this
// value.
const SENTIMENT_THRESHOLD = 0.3;
const SEVEN_DAYS_AGO = 60 * 60 * 24 * 7;

const ENTITIES_BASE_SQL = `SELECT name, type, count(name) as wc
FROM entities`;

const ENTITIES_SQL = ` GROUP BY name ORDER BY wc DESC
LIMIT ${NUM_ENTITIES};`;

const TABLE_SQL = `CREATE TABLE if not exists entities (
  name text,
  type text,
  salience real,
  wiki_url text,
  ts integer
);`;

function startController() {
  if (!process.env.SLACK_TOKEN_PATH) {
    throw new Error('Please set the SLACK_TOKEN_PATH environment variable!');
  }

  let token = fs.readFileSync(process.env.SLACK_TOKEN_PATH, {encoding: 'utf8'});
  token = token.replace(/\s/g, '');

  // Create the table that will store entity information if it does not already
  // exist.
  db.run(TABLE_SQL);

  controller.spawn({token: token}).startRTM(err => {
    if (err) {
      console.error('Failed to start controller!');
      console.error(err);
      throw err;
    }
  });

  return (
    controller
      // If the bot gets a DM or mention with 'hello' or 'hi', it will reply.  You
      // can use this to sanity-check your app without needing to use the NL API.
      .hears(
        ['hello', 'hi'],
        ['direct_message', 'direct_mention', 'mention'],
        handleSimpleReply
      )
      // If the bot gets a DM or mention including "top entities", it will reply with
      // a list of the top N most frequent entities used in this channel, as derived
      // by the NL API.
      .hears(
        ['top entities'],
        ['direct_message', 'direct_mention', 'mention'],
        handleEntitiesReply
      )
      // For any posted message, the bot will send the text to the NL API for
      // analysis.
      .on('ambient', handleAmbientMessage)
      .on('rtm_close', startBot)
  );
}

function startBot(bot) {
  console.error('RTM closed');
  let token = fs.readFileSync(process.env.SLACK_TOKEN_PATH, {encoding: 'utf8'});
  token = token.replace(/\s/g, '');

  bot.spawn({token: token}).startRTM(err => {
    if (err) {
      console.error('Failed to start controller!');
      console.error(err);
      throw err;
    }
  });
}

function handleSimpleReply(bot, message) {
  bot.reply(message, 'Hello.');
}

function handleEntitiesReply(bot, message) {
  bot.reply(message, 'Top entities: ');

  // Query the database for the top N entities in the past week
  const queryTs = Math.floor(Date.now() / 1000) - SEVEN_DAYS_AGO;
  // const entitiesWeekSql = `select * from entities`;
  const entitiesWeekSql = `${ENTITIES_BASE_SQL} WHERE ts > ${queryTs}${ENTITIES_SQL}`;
  db.all(entitiesWeekSql, (err, topEntities) => {
    if (err) {
      throw err;
    }

    let entityInfo = '';

    // Uncomment this to see the query results logged to console:
    // console.log(topEntities);

    topEntities.forEach(entity => {
      entityInfo += `entity: *${entity.name}*, type: ${entity.type}, count: ${
        entity.wc
      }\n`;
    });

    bot.reply(message, entityInfo);
  });
}

function analyzeEntities(text, ts) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = {
    // The document text, e.g. "Hello, world!"
    content: text,
    // The type of content to analyze
    type: 'PLAIN_TEXT',
  };

  // Detects entities in the document
  return language.analyzeEntities({document: document}).then(results => {
    const entities = results[0].entities;
    entities.forEach(entity => {
      const name = entity.name;
      const type = entity.type;
      const salience = entity.salience;
      let wikiUrl = '';
      if (entity.metadata.wikipedia_url) {
        wikiUrl = entity.metadata.wikipedia_url;
      }

      // Uncomment this to see the entity info logged to console:
      // console.log(`${name}, type: ${type}, w url: ${wikiUrl}, salience: ${salience}, ts: ${ts}`);

      db.run('INSERT INTO entities VALUES (?, ?, ?, ?, ?);', [
        name,
        type,
        salience,
        wikiUrl,
        Math.round(ts),
      ]);
    });

    return entities;
  });
}

function analyzeSentiment(text) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = {
    // The document text, e.g. "Hello, world!"
    content: text,
    // The type of content to analyze
    type: 'PLAIN_TEXT',
  };

  // Detects the 'sentiment' of some text using the NL API
  return language.analyzeSentiment({document: document}).then(results => {
    const sentiment = results[0];

    // Uncomment the following lines to log the sentiment to the console:
    // console.log(`Sentiment: ${sentiment}`)
    // if (sentiment.score >= SENTIMENT_THRESHOLD) {
    //   console.log('Sentiment: positive.');
    // } else if (sentiment.score <= -SENTIMENT_THRESHOLD) {
    //   console.log('Sentiment: negative.');
    // }

    return sentiment;
  });
}

function handleAmbientMessage(bot, message) {
  // Note: for purposes of this example, we're making two separate calls to the
  // API, one to extract the entities from the message, and one to analyze the
  // 'sentiment' of the message. These could be combined into one call.
  return analyzeEntities(message.text, message.ts)
    .then(() => analyzeSentiment(message.text))
    .then(sentiment => {
      if (sentiment.score >= SENTIMENT_THRESHOLD) {
        // We have a positive sentiment score larger than the threshold.
        bot.reply(message, ':thumbsup:');
      } else if (sentiment.score <= -SENTIMENT_THRESHOLD) {
        // We have a negative sentiment score of absolute value larger than
        // the threshold.
        bot.reply(message, ':thumbsdown:');
      }
    });
}

exports.ENTITIES_SQL = ENTITIES_SQL;
exports.TABLE_SQL = TABLE_SQL;
exports.startController = startController;
exports.handleSimpleReply = handleSimpleReply;
exports.handleEntitiesReply = handleEntitiesReply;
exports.analyzeEntities = analyzeEntities;
exports.analyzeSentiment = analyzeSentiment;
exports.handleAmbientMessage = handleAmbientMessage;

if (require.main === module) {
  startController();
}
