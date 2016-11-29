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
the README), then point 'slack_token_path' to that file when you run the script:

    echo my-slack-token > slack-token
    slack_token_path=./slack-token node demo_bot.js

See the README.md in this directory for more information about setup and usage.

*/

'use strict';

const Language = require('@google-cloud/language');
const Storage = require('@google-cloud/storage');


var Botkit = require('botkit');
var fs = require('fs');

var controller = Botkit.slackbot({debug: false});

var sqlite3 = require('sqlite3').verbose();
// create our database if it does not already exist.
var db = new sqlite3.Database('slackDB.db');

const util = require('util');

// the number of most frequent entities to retrieve from the db on request.
const NumEnts = 20;
// The magnitude of sentiment of a posted text above which the bot will respond.
const SentimentThresh = 30;

if (!process.env.slack_token_path) {
  console.log('Error: Specify slack_token_path in environment');
  process.exit(1);
}

fs.readFile(process.env.slack_token_path, (err, data) => {
  if (err) {
    console.log('Error: Specify token in slack_token_path file');
    process.exit(1);
  }
  data = String(data);
  data = data.replace(/\s/g, "");
  controller.spawn({token: data}).startRTM(function(err) {
    if (err) {
      throw new Error(err);
    }
  });
});

// create the table we'll use to store entity information if it does not already
// exist.
db.run('CREATE TABLE if not exists entities (name text, type text, ' +
  'salience real, wiki_url text, ts integer)');


function analyzeSentimentOfText (text) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = language.document({
    // The document text, e.g. "Hello, world!"
    content: text
  });

  // Detects the 'sentiment' of some text using the NL API
  return document.detectSentiment()
    .then((results) => {
      const sentiment = results[0];
      console.log(`Sentiment: ${sentiment >= 0 ? 'positive' : 'negative'}.`);
      return sentiment;
    });
}

function analyzeEntitiesOfText (text, ts) {
  // Instantiates a client
  const language = Language();

  // Instantiates a Document, representing the provided text
  const document = language.document({
    // The document text, e.g. "Hello, world!"
    content: text
  });

  // Detects entities in the document
  return document.detectEntities()
    .then((results) => {
      const entities = results[0];
      console.log('Entities:');
      for (let type in entities) {
        console.log(`${type}:`, entities[type]);
      }
      const entityList = results[1]['entities'];
      for (let ent of entityList) {
        // console.log(util.inspect(ent, false, null));
        const ename = ent['name'];
        const etype = ent['type'];
        const salience = ent['salience'];
        var wiki_url = '';
        if (ent['metadata']['wikipedia_url']) {
          wiki_url = ent['metadata']['wikipedia_url'];
        }
        // uncomment this to see the entity info logged to console.
        // console.log(ename + ', type: ' + etype + ', w url: ' + wiki_url +
        //   ', salience: ' + salience + 'ts ' + ts);
        db.run('INSERT into entities VALUES (?, ?, ?, ?, ?)',
            [ename, etype, salience, wiki_url, Math.round(ts)]);
      }
      return entities;
    });
}

// Query the database for the top N entities
var getEnts = function(callback) {
  db.all('select name, type, count(name) as wc from entities group by name ' +
      'order by wc desc limit ' + NumEnts + ';',
    function (err, all) {
        callback(err, all);
      });
}

// If the bot gets a DM or mention with 'hello' or 'hi', it will reply.  You
// can use this to sanity-check your app without needing to use the NL API.
controller.hears(
    ['hello', 'hi'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) {
      bot.reply(message, "Hello.");
    });

// if the bot gets a DM or mention including 'top entities', it will reply with
// a list of the top N most frequent 'entities' used in this channel, as derived
// by the NL API.
controller.hears(
    ['top entities'], ['direct_message', 'direct_mention', 'mention'],
    function(bot, message) {
      bot.reply(message, 'Top entities: ');
      var topEnts;
      var entInfo = '';
      getEnts(function(err, all) {
        topEnts = all;
        // uncomment this to see the query results logged to console.
        // console.log(util.inspect(topEnts, false, null));
        for (let row of topEnts) {
          entInfo += 'entity: *' + row['name'] + '*, type: ' + row['type'] +
            ', count: ' + row['wc'] + '\n';
        }
        bot.reply(message, entInfo);
      });
    });


// For any posted message, the bot will send the text to the NL API for
// analysis.
// Note: for purposes of this example, we're making two separate calls to the
// API, one to extract the entities from the message, and one to analyze the
// 'sentiment' of the message.  These could be combined into one call.
controller.on('ambient', function(bot, message) {
    var entities = analyzeEntitiesOfText(message.text, message.ts);
    var sentReply;
    analyzeSentimentOfText(message.text).then((results) => {
      console.log('in controller, sentiment is: ' + results);
      // if we have a positive sentiment of magnitude larger than the threshold
      if (results >= SentimentThresh) {
        sentReply = ':thumbsup:'
      }
      // if we have a negative sentiment of magnitude larger than the threshold
      else if (results <= -SentimentThresh) {
        sentReply = ':thumbsdown:'
      }
      if (sentReply) {
        bot.reply(message, sentReply);
      }
    });
  });
